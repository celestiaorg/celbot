// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

// Helpers
const { parseAction, parseIssueNumbers } = require("./utils/parse");
const { printJSON } = require("./utils/utils");

// Queries
// const { getIssueProjects } = require("./graphql/projects");

// Define actions
const syncEpic = "syncEpic";

// Create a map of actions
const actions = new Map();
actions.set(
  syncEpic,
  "syncEpic syncs an epic issue's labels, milestones, and projects to its task list issues."
);

const botName = "celbot";

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("Yay, the app was loaded!");

  app.on("issue_comment.created", async (context) => {
    app.log.info(`

####################################################

Received issue comment event

`);
    // app.log.info(`context: ${printJSON(context)}`);

    // Get the issue comment
    const comment = context.payload.comment.body;

    app.log.info(`Received comment: ${comment}`);
    // Extract the action from the comment
    const action = parseAction(comment, botName);

    if (!action) {
      app.log.info("Unable to parse action from comment");
      return;
    }

    // Process the action
    app.log.info(`Received ${action} action`);
    switch (action) {
      case syncEpic:
        await handleSyncEpic(context);
        break;
      default:
        app.log.info(`Received unknown action: ${action}`);
        app.log.info("Available actions are:");
        // Loop over the actions and print the available actions
        actions.forEach((description, action) => {
          app.log.info(`  ${action}: ${description}`);
        });

        break;
    }
    app.log.info(`

Issue comment event complete

####################################################
`);
  });
};

async function handleSyncEpic(context) {
  // Get the issue details
  const issue = await context.octokit.issues.get(context.issue());

  // Extract the labels, milestone, and projects
  const labels = issue.data.labels.map((label) => label.name);
  const milestone = issue.data.milestone ? issue.data.milestone.number : null;

  // Get projects related to the repository
  // const projects = await getIssueProjects(context, issue.data.number);

  // Extract the issue numbers from the task list
  const issueNumbers = parseIssueNumbers(issue.data.body);
  console.log(`handleSyncEpic extracted the following information:
  labels: ${labels}
  milestone: ${milestone}
  issueNumbers: ${issueNumbers}
  `);
  if (issueNumbers) {
    for (const issueNumber of issueNumbers) {
      // Apply the labels, milestone, and projects to the related issues
      await applyAttributes(context, issueNumber, labels, milestone);
    }
  }
}

function issueLabels(issue) {
  return issue.data.labels.map((label) => label.name);
}

async function applyAttributes(context, issueId, labels, milestone) {
  // Apply the labels
  if (labels.length > 0) {
    await context.octokit.issues.addLabels(
      context.issue({ issue_number: issueId, labels })
    );
  }

  // Apply the milestone
  if (milestone) {
    await context.octokit.issues.update(
      context.issue({ issue_number: issueId, milestone })
    );
  }

  // // Apply the projects
  // for (const project of projects.data) {
  //   // Get the project columns
  //   const columns = await context.octokit.projects.listColumns({
  //     project_id: project.id,
  //   });

  //   // Add the issue to the first column of the project
  //   if (columns.data.length > 0) {
  //     await context.octokit.projects.createCard({
  //       column_id: columns.data[0].id,
  //       content_id: issueId,
  //       content_type: "Issue",
  //     });
  //   }
  // }
}
