// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock

// Requiring nock to mock HTTP requests
const nock = require("nock");

// Requiring our app implementation
const myProbotApp = require("..");
const { Probot, ProbotOctokit } = require("probot");

// Requiring our fixtures
const issueCommentContext = require("./fixtures/issues.comment");
const issueCommentNoAction = require("./fixtures/issues.comment.no_action");

describe("My Probot app", () => {
  let probot;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      githubToken: "test",
      logLevel: "warn", // disable logging for testing
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test("takes no action when invalid action is specified", async () => {
    // Simulate the 'issue_comment.created' event
    await probot.receive(issueCommentNoAction);

    // No nock requests should have been made
    expect(nock.isDone()).toBe(true);
  });

  // test("Pull subtask issues from issue comment event", async () => {});
  // test("Pull milestones from issue comment event", async () => {});
  // test("Pull labels from issue comment event", async () => {});

  test("applies labels, milestones, and projects on syncEpic events", async () => {
    const issueNumber = issueCommentContext.payload.issue.number;
    const repo = issueCommentContext.payload.repository;

    // Mock the GitHub API
    nock("https://api.github.com")
      // Mock the GET issue request to get the body of the issue
      .get(`/repos/${repo.owner.login}/${repo.name}/issues/${issueNumber}`)
      .reply(200, {
        body: "- [ ] #1\n- [ ] #2\nsome random text #3",
        labels: [{ name: "label1" }],
        milestone: { number: 1 },
      })

      /*
      TODO: projects need to be implemented

      // Mock the GET Projects request to get the repository projects
      .get(`/repos/${repo.owner.login}/${repo.name}/projects`)
      .reply(200, [{ id: 1 }, { id: 2 }])

      // Mock the GET request for the columns of the projects
      .get("/projects/1/columns")
      .reply(200, [{ id: 11 }])

      .get("/projects/2/columns")
      .reply(200, [{ id: 21 }]);
      
    */

      // Mock Post requests to add labels, milestones, and projects
      .post(`/repos/${repo.owner.login}/${repo.name}/issues/1/labels`)
      .reply(200)
      .post(`/repos/${repo.owner.login}/${repo.name}/issues/2/labels`)
      .reply(200)
      .patch(`/repos/${repo.owner.login}/${repo.name}/issues/1`, {
        milestone: 1,
      })
      .reply(200)
      .patch(`/repos/${repo.owner.login}/${repo.name}/issues/2`, {
        milestone: 1,
      })
      .reply(200)
      /*

      TODO: add back in when projects are implemented

      .post("/projects/columns/11/cards", {
        content_id: 1,
        content_type: "Issue",
      })
      .reply(201)
      .post("/projects/columns/11/cards", {
        content_id: 2,
        content_type: "Issue",
      })
      .reply(201)
      .post("/projects/columns/21/cards", {
        content_id: 1,
        content_type: "Issue",
      })
      .reply(201)
      .post("/projects/columns/21/cards", {
        content_id: 2,
        content_type: "Issue",
      })
      .reply(201);
    */

      // Add in extra mocks for a post event to issue #3 that should not happen
      .post(`/repos/${repo.owner.login}/${repo.name}/issues/3/labels`)
      .reply(200)
      .patch(`/repos/${repo.owner.login}/${repo.name}/issues/3`, {
        milestone: 1,
      })
      .reply(200);

    await probot.receive(issueCommentContext);

    // Check if all API calls were made as expected
    // TODO: not sure why these requests are duplicated
    expect(nock.pendingMocks()).toEqual([
      "POST https://api.github.com:443/repos/test_user/test_repo/issues/3/labels",
      "PATCH https://api.github.com:443/repos/test_user/test_repo/issues/3",
      "POST https://api.github.com:443/repos/test_user/test_repo/issues/3/labels",
      "PATCH https://api.github.com:443/repos/test_user/test_repo/issues/3",
    ]);
  });
});
