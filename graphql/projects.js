const { printJSON } = require("../utils/utils");
const { graphqlQuery } = require("./query");

// Import Queries
const {
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
} = require("./project_queries");

// getIssueProjects returns all projects that the given issue is in.
async function getIssueProjects(context, issueID) {
  const repoProjects = await getRepoProjects(context);
  const orgProjects = await getOrgProjects(context);

  const allProjects = [...repoProjects, ...orgProjects];
  const issueProjects = [];

  for (const project of allProjects) {
    // Ignore closed projects
    if (project.closed) continue;
    // Ignore projects already in the list. This can happen because projects
    // will show up on both the repo and org level.
    if (issueProjects.includes(project)) continue;
    // Ignore projects that the issue is not in
    if (!(await isIssueInProject(context, issueID, project.number))) continue;

    // Add project to list
    issueProjects.push(project);
  }

  return issueProjects;
}

// getOrgProjects queries the projects for the given organization based on the
// provided context from the Github graphql api.
async function getOrgProjects(context) {
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
}

// getRepoProjects queries the projects for the given repository based on the
// provided context from the Github graphql api.
async function getRepoProjects(context) {
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
}

async function isIssueInProject(context, issueID, projectNumber) {
  const items = await getProjectItems(context, projectNumber);

  for (const item of items) {
    if (item.type !== "ISSUE") continue;
    if (item.id === issueID) return true;
  }

  return false;
}

// TODO: need pagination since projects can have more than 100 items
async function getProjectItems(context, projectNumber) {
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
}

module.exports = {
  getIssueProjects,
  getProjectItems,
  getOrgProjects,
  getRepoProjects,
  isIssueInProject,
};
