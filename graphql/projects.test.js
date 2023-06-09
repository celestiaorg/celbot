// Import necessary modules
const {
  addIssueToProject,
  isIssueInProject,
  getIssueProjects,
  getOrgProjects,
  getProjectItems,
  getRepoProjects,
} = require("./projects");
const {
  addProjectV2ItemByItemIDQuery,
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
} = require("./project_queries");
const { describeWithErrorsLogSurpressed } = require("../test/utils");

// Common test data
//
// Define repo object for context
const owner = "test-owner";
const repo = "test-repo";
const repoObject = { owner, repo };
// Projects: There should be 2 repo projects and 3 org projects. The 2 repo
// projects will show up in the org projects list.
const project1 = {
  id: "1",
  title: "Project 1",
  closed: false,
  number: 1,
};
const project2 = {
  id: "2",
  title: "Project 2",
  closed: true,
  number: 2,
};
const project3 = {
  id: "3",
  title: "Project 3",
  closed: false,
  number: 3,
};
const repoProjectsV2 = {
  nodes: [project1, project2],
};
const orgProjectsV2 = {
  nodes: [project1, project2, project3],
};
// Items: There should be 2 items in each project. One of the items should be an
// issue and the other should not be an issue. One issue item should exist in
// all 3 projects.
const commonItem1 = {
  id: "p1",
  type: "ISSUE",
  content: {
    id: "1",
  },
};
const item2 = {
  id: "p2",
  type: "NOTISSUE",
  content: {},
};
const item3 = {
  id: "p3",
  type: "ISSUE",
  content: {
    id: "3",
  },
};
const item4 = {
  id: "p4",
  type: "NOTISSUE",
  content: {},
};
const project1Items = { nodes: [commonItem1, item2] };
const project2Items = { nodes: [commonItem1, item3] };
const project3Items = { nodes: [commonItem1, item4] };
// Create mock contexts
const baseMockContext = {
  repo: () => repoObject,
};
const errorContext = {
  ...baseMockContext,
  octokit: {
    graphql: jest.fn().mockRejectedValue(new Error("Fetch error")),
  },
};
const mockNoResponseContext = {
  ...baseMockContext,
  octokit: {
    graphql: jest.fn().mockResolvedValue({}),
  },
};
const mockContext = {
  ...baseMockContext,
  octokit: {
    graphql: jest.fn().mockImplementation((query, variables) => {
      if (query === orgProjectsV2QueryString) {
        return {
          organization: {
            projectsV2: orgProjectsV2,
          },
        };
      } else if (query === orgProjectV2ItemsQueryString) {
        let items;
        switch (variables.projectNumber) {
          case 1:
            items = project1Items;
            break;
          case 2:
            items = project2Items;
            break;
          case 3:
            items = project3Items;
            break;
          default:
            console.log(variables.number);
            throw new Error("Unexpected query");
        }
        return {
          organization: {
            projectV2: {
              items: items,
            },
          },
        };
      } else if (query === repoProjectsV2QueryString) {
        return {
          repository: {
            projectsV2: repoProjectsV2,
          },
        };
      } else if (
        query ===
        addProjectV2ItemByItemIDQuery(variables.projectID, variables.contentID)
      ) {
        return {
          clientMutationID: null,
        };
      } else {
        throw new Error("Unexpected query");
      }
    }),
  },
};

describe("addIssueToProejct", () => {
  describe("issue is not in project", () => {
    it("should add the issue to the project", async () => {
      // call addIssueToProject with mock data
      await addIssueToProject(mockContext, item3.id, project1.id);
      // Verify that the issue was added to the project
      expect(mockContext.octokit.graphql).toHaveBeenCalledWith(
        addProjectV2ItemByItemIDQuery(project1.id, item3.id),
        {}
      );
    });
  });
  // For tests were we are intentionally expecting an error, we can suppress the
  // console.error output
  const supressErrorLogTests = [
    {
      description: "should return null when an error occurs",
      func: async () => {
        const response = await addIssueToProject(
          errorContext,
          commonItem1.id,
          project1.id
        );
        expect(response).toEqual(null);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});

describe("getIssueProjects", () => {
  describe("issue exists in a project", () => {
    it("should return an array of open projects that the issue is in", async () => {
      // call getIssuesProjects with mock data
      const projects = await getIssueProjects(
        mockContext,
        commonItem1.content.id
      );
      // Verify only open projects are returned
      projects.forEach((project) => {
        expect(project.closed).toBe(false);
      });
      // Verify that the project returned is the correct one
      expect(projects.length).toBe(2);
      expect(projects[0]).toEqual(project1);
      expect(projects[1]).toEqual(project3);
    });
  });
  describe("issue does not exist in a project", () => {
    it("should return an empty array if the issue is not in any", async () => {
      // call getIssuesProjects with mock data
      const projects = await getIssueProjects(mockContext, "asf");
      // Verify no projects returned
      expect(projects.length).toBe(0);
    });
    describeWithErrorsLogSurpressed("with suppressed console.error", [
      {
        description: "should return an empty array if there are no projects",
        func: async () => {
          // call getIssuesProjects with mock data
          const projects = await getIssueProjects(mockNoResponseContext, "asf");
          // Verify no projects returned
          expect(projects.length).toBe(0);
        },
      },
    ]);
  });
});

describe("getIssueProjects", () => {
  it("should return true if issue is in project", async () => {
    expect(
      await isIssueInProject(
        mockContext,
        commonItem1.content.id,
        project1.number
      )
    ).toBe(true);
  });
  it("should return false if item in project is not an issue", async () => {
    expect(await isIssueInProject(mockContext, item2.id, project1.number)).toBe(
      false
    );
  });
  it("should return false if issue is not in project", async () => {
    expect(
      await isIssueInProject(mockContext, item3.content.id, project1.number)
    ).toBe(false);
  });
});

describe("getOrgProjects", () => {
  it("should use the correct GraphQL query and variables", async () => {
    await getOrgProjects(mockContext);
    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(
      orgProjectsV2QueryString,
      {
        owner,
      }
    );
  });

  it("should return an array of projects", async () => {
    const projects = await getOrgProjects(mockContext);
    expect(projects.length).toBe(3);
    expect(projects[0]).toEqual(project1);
    expect(projects[1]).toEqual(project2);
    expect(projects[2]).toEqual(project3);
  });

  // For tests were we are intentionally expecting an error, we can suppress the
  // console.error output
  const supressErrorLogTests = [
    {
      description: "should return an empty array when an error occurs",
      func: async () => {
        const projects = await getOrgProjects(errorContext);
        expect(projects).toEqual([]);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});

describe("getProjectItems", () => {
  let projectNumber = project1.number;
  it("should use the correct GraphQL query and variables", async () => {
    await getProjectItems(mockContext, projectNumber);
    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(
      orgProjectV2ItemsQueryString,
      {
        owner,
        projectNumber,
      }
    );
  });
  it("should return an array of items", async () => {
    const projectItems = await getProjectItems(mockContext, projectNumber);
    expect(projectItems.length).toBe(2);
    expect(projectItems[0]).toEqual(commonItem1);
    expect(projectItems[1]).toEqual(item2);
  });

  // For tests were we are intentionally expecting an error, we can suppress the
  // console.error output
  const supressErrorLogTests = [
    {
      description: "should return an empty array when an error occurs",
      func: async () => {
        const projectItems = await getProjectItems(errorContext, projectNumber);
        expect(projectItems).toEqual([]);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});

describe("getRepoProjects", () => {
  it("should use the correct GraphQL query and variables", async () => {
    await getRepoProjects(mockContext);
    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(
      repoProjectsV2QueryString,
      {
        owner,
        repo,
      }
    );
  });
  it("should return an array of projects", async () => {
    const projects = await getRepoProjects(mockContext);
    expect(projects.length).toBe(2);
    expect(projects[0]).toEqual(project1);
    expect(projects[1]).toEqual(project2);
  });

  // For tests were we are intentionally expecting an error, we can suppress the
  // console.error output
  const supressErrorLogTests = [
    {
      description: "should return an empty array when an error occurs",
      func: async () => {
        const projects = await getRepoProjects(errorContext);
        expect(projects).toEqual([]);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});
