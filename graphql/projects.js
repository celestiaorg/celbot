const { printJSON } = require("../utils/utils");

exports.getIssueProjects = async function (context, issueID) {
  const repoProjects = await fetchRepoProjects(context);
  // console.log("repoProjects:", printJSON(repoProjects));
  const orgProjects = await fetchOrgProjects(context);
  // console.log("orgProjects:", printJSON(orgProjects));

  const allProjects = [...repoProjects, ...orgProjects];
  const issueProjects = [];

  for (const project of allProjects) {
    if (project.closed) continue;
    if (await isIssueInProject(context, issueID, project.number)) {
      issueProjects.push(project);
    }
  }

  return issueProjects;
};

// fetchOrgProjects fetches the projects for the given organization based on the
// provided context.
async function fetchOrgProjects(context) {
  const owner = context.repo().owner;

  const query = `
	  query ($owner: String!) {
	    organization(login: $owner) {
	      projectsV2(first: 100) {
		nodes {
		  id
		  title
		  closed
		  number
		}
	      }
	    }
	  }
	`;

  try {
    const result = await context.octokit.graphql(query, {
      owner,
    });

    return result.organization.projectsV2.nodes;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}
// fetchRepoProjects fetches the projects for the given repository based on the
// provided context.
async function fetchRepoProjects(context) {
  const owner = context.repo().owner;
  const repo = context.repo().repo;

  const query = `
	  query ($owner: String!, $repo: String!) {
	    repository(owner: $owner, name: $repo) {
	      projectsV2(first: 100) {
		nodes {
		  id
		  title
		  closed
		  number
		}
	      }
	    }
	  }
	`;

  try {
    const result = await context.octokit.graphql(query, {
      owner,
      repo,
    });

    return result.repository.projectsV2.nodes;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

async function isIssueInProject(context, issueID, projectNumber) {
  const items = await getProjectItems(context, projectNumber);

  // console.log(
  //   `isIssueInProject found ${items.length} items for the project ${projectNumber}.`
  // );
  // console.log(`views ${printJSON(items)}`);

  for (const item of items) {
    if (item.node.type !== "ISSUE") continue;
    if (item.node.id === issueID) return true;
  }

  return false;
}
async function getProjectItems(context, projectNumber) {
  const owner = context.repo().owner;

  const query = `
	  query ($owner: String!, $projectNumber: Int!) {
	    organization(login: $owner) {
	      projectV2(number: $projectNumber) {
          items(last: 100) {
            edges {
              node {
                id
                type
              }
            }
          }
	      }
	    }
	  }
	`;

  try {
    const result = await context.octokit.graphql(query, {
      owner,
      projectNumber,
    });

    return result.organization.projectV2.items.edges;
  } catch (error) {
    console.error("Error fetching views:", error);
  }
}
