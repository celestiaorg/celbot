// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

// Helpers
const { parseAction, parseIssueNumbers } = require("./utils/parse");
const { printJSON } = require("./utils/utils");

// Queries
const { addIssueToProject, getIssueProjects } = require("./graphql/projects");

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
        await handleSyncEpic(app, context);
        break;
      default:
        app.log.info(`Received unknown action: ${action}`);
        app.log.info("Available actions are:");
        // Loop over the actions and print the available actions
        actions.forEach((action, description) => {
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

// NOTE: this only works for subissues that are in the same repo as the epic
// issue as the owner and repo are pulled from the context of the epic issue.
async function handleSyncEpic(app, context) {
  // Get the issue details
  let issue;
  try {
    issue = await context.octokit.issues.get(context.issue());
  } catch (error) {
    app.log.info(`Unable to get issue details: ${error}`);
    return;
  }

  // Extract the labels, milestone, and projects
  const labels = issue.data.labels.map((label) => label.name);
  const milestone = issue.data.milestone ? issue.data.milestone.number : null;

  // Get projects related to the repository
  //
  // TODO: need to Debug, queries are running but no projects are returning
  let projects;
  try {
    projects = await getIssueProjects(context, issue.data.node_id);
  } catch (error) {
    app.log.info(`Unable to get projects: ${error}`);
    return;
  }

  // Extract the issue numbers from the task list
  const issueNumbers = parseIssueNumbers(issue.data.body);
  console.log(`handleSyncEpic extracted the following information:
  labels: ${labels}
  milestone: ${milestone}
  projects: ${printJSON(projects)}
  issueNumbers: ${issueNumbers}
  `);
  if (!issueNumbers) {
    app.log.info("Now issue numbers found in the epic issue body");
    return;
  }

  // Apply the labels, milestone, and projects to the related issues
  for (const issueNumber of issueNumbers) {
    try {
      await applyAttributes(
        app,
        context,
        issueNumber,
        labels,
        milestone,
        projects
      );
    } catch (error) {
      app.log.info(
        `Unable to apply attributes for issue #${issueNumber}: ${error}`
      );
    }
  }
}

async function applyAttributes(
  app,
  context,
  issueNumber,
  labels,
  milestone,
  projects
) {
  // Apply the labels
  if (labels.length > 0) {
    app.log.info(`Applying labels: ${labels}`);
    await context.octokit.issues.addLabels(
      context.issue({ issue_number: issueNumber, labels })
    );
  } else {
    app.log.info("No labels to apply");
  }

  // Apply the milestone
  if (milestone) {
    app.log.info(`Applying milestone: ${milestone}`);
    await context.octokit.issues.update(
      context.issue({ issue_number: issueNumber, milestone })
    );
  } else {
    app.log.info("No milestone to apply");
  }

  // Get the issue for the node_id
  const issue = await context.octokit.rest.issues.get({
    owner: context.repo().owner,
    repo: context.repo().repo,
    issue_number: issueNumber,
  });

  // Apply the projects
  for (const project of projects) {
    app.log.info(`Applying project: ${project.name}`);
    try {
      await addIssueToProject(context, issue.data.node_id, project.id);
    } catch (error) {
      app.log.error(
        `Error adding issue #${issueNumber} to project '${project.title}': ${error}`
      );
    }
  }
}
