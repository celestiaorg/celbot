const { printJSON } = require("../utils/utils");
const { graphqlQuery } = require("./query");

// Import Queries
const {
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
} = require("./project_queries");

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

// getOrgProjects queries the projects for the given organization based on the
// provided context from the Github graphql api.
exports.getOrgProjects = async function (context) {
  const owner = context.repo().owner;
  try {
    const result = await graphqlQuery(context, orgProjectsV2QueryString, {
      owner,
    });

    return result.organization.projectsV2.nodes;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// getRepoProjects queries the projects for the given repository based on the
// provided context from the Github graphql api.
exports.getRepoProjects = async function (context) {
  const owner = context.repo().owner;
  const repo = context.repo().repo;
  try {
    const result = await graphqlQuery(context, repoProjectsV2QueryString, {
      owner,
      name: repo,
    });

    return result.repository.projectsV2.nodes;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

async function isIssueInProject(context, issueID, projectNumber) {
  const items = await getProjectItems(context, projectNumber);

  // console.log(
  //   `isIssueInProject found ${items.length} items for the project ${projectNumber}.`
  // );
  console.log(`views ${printJSON(items)}`);

  for (const item of items) {
    if (item.node.type !== "ISSUE") continue;
    if (item.node.id === issueID) return true;
  }

  return false;
}

// TODO: need pagination since projects can have more than 100 items
exports.getProjectItems = async function (context, projectNumber) {
  const owner = context.repo().owner;

  try {
    const result = await graphqlQuery(context, orgProjectV2ItemsQueryString, {
      owner,
      number: projectNumber,
    });

    return result.organization.projectV2.items.nodes;
  } catch (error) {
    console.error("Error fetching views:", error);
    return [];
  }
};
