const { parseAction, parseIssueNumbers } = require("./parse");

describe("parseAction fuzz testing", () => {
  const testCases = [
    ["@celbot action", "celbot", "action"],
    [
      `
    @celbot action`,
      "celbot",
      null,
    ],
    ["@celbot action", "", null],
    ["@celbot action", "asdf", null],
    ["@celbot", "celbot", null],
    ["@celbot       ", "celbot", null],
    ["action @celbot", "celbot", null],
    ["action", "celbot", null],
    ["@celbot action asdf", "celbot", "action"],
    ["@celbot action more and more text", "celbot", "action"],
  ];
  test.each(testCases)(
    "parseAction(%s, %s) returns %s",
    (comment, botName, expected) => {
      expect(parseAction(comment, botName)).toEqual(expected);
    }
  );
});

describe("parseIssueNumbers fuzz testing", () => {
  const testCases = [
    [
      `- [ ] #42
  - [ ] some text #43
  - [ ] #44 some text
  `,
      [42, 43, 44],
    ],
    [
      `
  - [ ] #42
- [ ] some text #43
  - [ ] #44 some text
  `,
      [42, 43, 44],
    ],
    [
      `
  - [ ] #42
  - [ ] some text #43
  - [x] #44 some text
  `,
      [42, 43],
    ],
    ["- [ ] #42", [42]],
    [" - [ ] #42", [42]],
    ["#42", []],
    ["# 42", []],
    ["Some text #42", []],
    ["#42 some text", []],
    ["only some text", []],
    ["", []],
  ];
  test.each(testCases)("parseIssueNumbers(%s) returns %s", (body, expected) => {
    expect(parseIssueNumbers(body)).toEqual(expected);
  });
});
