const orgProjectsV2QueryString = `
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

module.exports = {
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
};
