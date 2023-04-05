function parseAction(comment, botName) {
  if (botName === "") return null;
  if (!comment.startsWith(`@${botName}`)) return null;
  if (comment.split(" ").length < 2) return null;
  if (comment.split(" ")[1].trim() === "") return null;
  if (comment === "") return null;

  // Remove the bot name from the comment
  var action = comment.split(`@${botName}`)[1].trim();
  // Remove any trailing text
  action = action.split(" ")[0];
  return action;
}
module.exports = parseAction;
