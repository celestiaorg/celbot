// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock

const nock = require("nock");
// Requiring our app implementation
const myProbotApp = require("..");
const { Probot, ProbotOctokit } = require("probot");
// Requiring our fixtures
const payload = require("./fixtures/issues.opened");
const issueCreatedBody = { body: "Thanks for opening this issue!" };
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);
describe("My Probot app", () => {
  let probot;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      appId: 123,
      privateKey,
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);
  });
  test("applies labels, milestones, and projects to related issues", async () => {
    const issueNumber = issueCommentCreatedPayload.issue.number;
    const repo = issueCommentCreatedPayload.repository;
    const installationId = issueCommentCreatedPayload.installation.id;

    nock("https://api.github.com")
      .post(`/app/installations/${installationId}/access_tokens`)
      .reply(200, { token: "test-token" })

      .get(`/repos/${repo.owner.login}/${repo.name}/issues/${issueNumber}`)
      .reply(200, {
        body: "- [ ] #1\n- [ ] #2",
        labels: [{ name: "label1" }],
        milestone: { number: 1 },
      })

      .get(`/repos/${repo.owner.login}/${repo.name}/projects`)
      .reply(200, [{ id: 1 }, { id: 2 }])

      .get("/projects/1/columns")
      .reply(200, [{ id: 11 }])

      .get("/projects/2/columns")
      .reply(200, [{ id: 21 }]);

    nock("https://api.github.com", {
      reqheaders: {
        "content-type": "application/json",
        authorization: "token test-token",
      },
    })
      .persist()
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

    // Simulate the webhook event
    const simulatedPayload = {
      ...issueCommentCreatedPayload,
      comment: {
        ...issueCommentCreatedPayload.comment,
        body: "@botname apply",
      },
    };

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: simulatedPayload,
    });

    // Check if all API calls were made as expected
    expect(nock.pendingMocks()).toEqual([]);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
