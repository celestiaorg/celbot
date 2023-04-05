const parseAction = require("./parse");
describe("parseAction fuzz testing", () => {
  const table = [
    ["@celbot action", "celbot", "action"],
    ["@celbot action", "", null],
    ["@celbot action", "asdf", null],
    ["@celbot", "celbot", null],
    ["action @celbot", "celbot", null],
    ["action", "celbot", null],
    ["@celbot action asdf", "celbot", "action"],
    ["@celbot action more and more text", "celbot", "action"],
  ];
  test.each(table)(
    "parseAction(%s, %s) returns %s",
    (comment, botName, expected) => {
      expect(parseAction(comment, botName)).toBe(expected);
    }
  );
});
