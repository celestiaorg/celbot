// Import necessary modules
const { fetchRepoProjects, fetchOrgProjects } = require("./projects");
const { orgProjectsV2, repoProjectsV2 } = require("./project_queries");
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

describe("fetchOrgProjects", () => {
  it("fetchOrgProjects should use the correct GraphQL query and variables", async () => {
    const mockContext = {
      repo: () => ({ owner: "test-owner" }),
      octokit: {
        graphql: jest.fn().mockResolvedValue({
          organization: {
            projectsV2: projectsV2,
          },
        }),
      },
    };

    await fetchOrgProjects(mockContext);

    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(orgProjectsV2, {
      owner: "test-owner",
    });
  });

  it("should return an array of projects", async () => {
    // Mock the context object
    const context = {
      repo: () => ({ owner: "test-owner", repo: "test-repo" }),
      octokit: {
        graphql: jest.fn().mockResolvedValue({
          organization: {
            projectsV2: projectsV2,
          },
        }),
      },
    };

    const projects = await fetchOrgProjects(context);
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
        // Mock the context object with a rejected promise
        const context = {
          repo: () => ({ owner: "test-owner", repo: "test-repo" }),
          octokit: {
            graphql: jest.fn().mockRejectedValue(new Error("Fetch error")),
          },
        };

        const projects = await fetchOrgProjects(context);
        expect(projects).toEqual([]);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});

// Test case
describe("fetchRepoProjects", () => {
  it("fetchRepoProjects should use the correct GraphQL query and variables", async () => {
    const mockContext = {
      repo: () => ({ owner: "test-owner", repo: "test-repo" }),
      octokit: {
        graphql: jest.fn().mockResolvedValue({
          repository: {
            projectsV2: projectsV2,
          },
        }),
      },
    };

    await fetchRepoProjects(mockContext);

    expect(mockContext.octokit.graphql).toHaveBeenCalledWith(repoProjectsV2, {
      owner: "test-owner",
      repo: "test-repo",
    });
  });
  it("should return an array of projects", async () => {
    // Mock the context object
    const context = {
      repo: () => ({ owner: "test-owner", repo: "test-repo" }),
      octokit: {
        graphql: jest.fn().mockResolvedValue({
          repository: {
            projectsV2: projectsV2,
          },
        }),
      },
    };

    const projects = await fetchRepoProjects(context);
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
        // Mock the context object with a rejected promise
        const context = {
          repo: () => ({ owner: "test-owner", repo: "test-repo" }),
          octokit: {
            graphql: jest.fn().mockRejectedValue(new Error("Fetch error")),
          },
        };

        const projects = await fetchRepoProjects(context);
        expect(projects).toEqual([]);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});
