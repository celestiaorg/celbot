const addProjectV2ItemByItemIDQueryString = `
mutation ($contentId: ID!, $projectId: ID!) {
	addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
	  clientMutationId
	}
}
`;

const orgProjectsV2QueryString = `
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

const repoProjectsV2QueryString = `
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

const orgProjectV2ItemsQueryString = `
query ($owner: String!, $projectNumber: Int!) {
	organization(login: $owner) {
		projectV2(number: $projectNumber) {
			items(last: 100) {
				nodes {
					id
					type
				}
			}
		}
	}
}
`;

module.exports = {
  addProjectV2ItemByItemIDQueryString,
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
};
