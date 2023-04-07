const { isValid, graphqlQuery } = require("./query");
const { describeWithErrorsLogSurpressed } = require("../test/test");

const validQuery = `
{
  viewer {
    id
  }
}
`;

const invalidQuery = "query { hello }";

describe("isValid method", function () {
  // Test for valid queries
  it("should return true for a valid query", async () => {
    const valid = await isValid(validQuery);
    expect(valid).toBe(true);
  });

  // Test invalid query case
  const supressErrorLogTests = [
    {
      description: "should return false for an invalid query",
      func: async () => {
        const valid = await isValid(invalidQuery);
        expect(valid).toBe(false);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});

describe("graphqlQuery method", () => {
  const mockContext = {
    octokit: {
      graphql: jest.fn().mockResolvedValue({}), // no return value needed
    },
  };
  // Mock the context object with a rejected promise
  const errorContext = {
    octokit: {
      graphql: jest.fn().mockRejectedValue(new Error("Fetch error")),
    },
  };

  describe("should be successful", () => {
    let owner = "test-owner";
    let repo = "test-repo";
    let query = validQuery;

    it("with no variables", async () => {
      const result = await graphqlQuery(mockContext, query);
      expect(mockContext.octokit.graphql).toHaveBeenCalledWith(query, {});
      expect(result).toEqual({});
    });
    it("with an empty variable", async () => {
      const result = await graphqlQuery(mockContext, query, {});
      expect(mockContext.octokit.graphql).toHaveBeenCalledWith(query, {});
      expect(result).toEqual({});
    });
    it("with a single variable", async () => {
      const result = await graphqlQuery(mockContext, query, { owner });
      expect(mockContext.octokit.graphql).toHaveBeenCalledWith(query, {
        owner: owner,
      });
      expect(result).toEqual({});
    });
    it("with multiple variables", async () => {
      const result = await graphqlQuery(mockContext, query, { owner, repo });
      expect(mockContext.octokit.graphql).toHaveBeenCalledWith(query, {
        owner: owner,
        repo: repo,
      });
      expect(result).toEqual({});
    });
  });

  // TODO: finish tests
  const supressErrorLogTests = [
    {
      description: "invalid context should throw an error and return undefined",
      func: async () => {
        const result = await graphqlQuery({}, validQuery);
        expect(result).toEqual(undefined);
      },
    },
    {
      description: "when an error is thrown undefined should be returned",
      func: async () => {
        const result = await graphqlQuery(errorContext, validQuery);
        expect(result).toEqual(undefined);
      },
    },
    {
      description: "empty query should throw an error and return undefined",
      func: async () => {
        const result = await graphqlQuery(errorContext, "");
        expect(result).toEqual(undefined);
      },
    },
    {
      description: "invalid query should throw an error and return undefined",
      func: async () => {
        const result = await graphqlQuery(errorContext, invalidQuery);
        expect(result).toEqual(undefined);
      },
    },
  ];
  describeWithErrorsLogSurpressed(
    "with suppressed console.error",
    supressErrorLogTests
  );
});
