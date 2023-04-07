// Import necessary modules
const {
  getOrgProjects,
  getProjectItems,
  getRepoProjects,
} = require("./projects");
const {
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
} = require("./project_queries");
const { describeWithErrorsLogSurpressed } = require("../test/test");

// Common test data
const project1 = {
  id: "1",
  title: "Project 1",
  closed: false,
  number: 1,
};
const project2 = {
  id: "2",
  title: "Project 2",
  closed: false,
  number: 2,
};
const projectsV2 = {
  nodes: [project1, project2],
};
const owner = "test-owner";
const repo = "test-repo";
const repoObject = { owner, repo };
const item1 = {
  id: "1",
  type: "ISSUE",
};
const item2 = {
  id: "2",
  type: "NOTISSUE",
};
const items = { nodes: [item1, item2] };

const errorContext = {
  repo: () => repoObject,
  octokit: {
    graphql: jest.fn().mockRejectedValue(new Error("Fetch error")),
  },
};

describe("getOrgProjects", () => {
  const mockContext = {
    repo: () => repoObject,
    octokit: {
      graphql: jest.fn().mockResolvedValue({
        organization: {
          projectsV2: projectsV2,
        },
      }),
    },
  };

  it("getOrgProjects should use the correct GraphQL query and variables", async () => {
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
  const mockContext = {
    repo: () => ({ owner: owner }),
    octokit: {
      graphql: jest.fn().mockResolvedValue({
        organization: {
          projectV2: {
            items: items,
          },
        },
      }),
    },
  };
  let projectNumber = 1;
  it("getProjectItems should use the correct GraphQL query and variables", async () => {
    await getProjectItems(mockContext, projectNumber);
    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(
      orgProjectV2ItemsQueryString,
      {
        owner: owner,
        number: projectNumber,
      }
    );
  });
  it("should return an array of items", async () => {
    const projectItems = await getProjectItems(mockContext, projectNumber);
    expect(projectItems.length).toBe(2);
    expect(projectItems[0]).toEqual(item1);
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
  const mockContext = {
    repo: () => repoObject,
    octokit: {
      graphql: jest.fn().mockResolvedValue({
        repository: {
          projectsV2: projectsV2,
        },
      }),
    },
  };

  it("getRepoProjects should use the correct GraphQL query and variables", async () => {
    await getRepoProjects(mockContext);
    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(
      repoProjectsV2QueryString,
      {
        owner,
        name: repo,
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
