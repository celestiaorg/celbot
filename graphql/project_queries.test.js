const { isValid } = require("./query");
const {
  addProjectV2ItemByItemIDQuery,
  orgProjectsV2QueryString,
  orgProjectV2ItemsQueryString,
  repoProjectsV2QueryString,
} = require("./project_queries");

describe("Verify Project Queries are Valid", function () {
  // Test for valid queries
  validTest = function (description, query) {
    test(description, async () => {
      const valid = await isValid(query);
      expect(valid).toBe(true);
    });
  };

  validTest(
    "expect addProjectV2ItemByItemIDQueryString to be valid",
    addProjectV2ItemByItemIDQuery("projectID", "issueID")
  );
  validTest("expect orgProjectsV2 to be valid", orgProjectsV2QueryString);
  validTest(
    "expect orgProjectV2Items to be valid",
    orgProjectV2ItemsQueryString
  );
  validTest("expect repoProjectsV2 to be valid", repoProjectsV2QueryString);
});
