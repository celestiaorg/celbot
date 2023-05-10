// parseAction parses the action from the comment. It returns null if any of the
// following are true:
//  - The bot name is empty
//  - The comment is empty
//  - The bot name is not mentioned in the comment
//  - The comment does not start with the bot name
//  - The comment does not contain an action
function parseAction(comment, botName) {
  if (botName === "") return null;
  if (comment === "") return null;
  if (!comment.includes(`@${botName}`)) return null;
  if (!comment.startsWith(`@${botName}`)) return null;
  if (comment.split(" ").length < 2) return null;
  if (comment.split(" ")[1].trim() === "") return null;

  // Remove the bot name from the comment
  var action = comment.split(`@${botName}`)[1].trim();
  // Remove any trailing text
  action = action.split(" ")[0];
  return action;
}

// This is pulling out the task list items from the issue body. It is currently
// matching the following
//
//  '- [ ] #41',
//  '  - [ ] #42',
//  '- [ ] some text #43',
//  '- [ ] #44 some text',
//  '- [x] #45', // This line should not match
//  'some text referencing #46', // This line should not match
function parseIssueNumbers(body) {
  const issueNumbers = [];
  const regexPattern = /^\s*- \[ \] (?:.* )?#(\d+)(?: .*)?$/gmu;
  let match;

  if (body === "") return issueNumbers;

  while ((match = regexPattern.exec(body)) !== null) {
    issueNumbers.push(parseInt(match[1], 10));
  }

  return issueNumbers;
}

module.exports = {
  parseAction,
  parseIssueNumbers,
};
