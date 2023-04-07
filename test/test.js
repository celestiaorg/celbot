exports.describeWithErrorsLogSurpressed = function (description, tests) {
  describe(description, function () {
    let originalConsoleError;
    // Override console.error before each test
    beforeEach(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });
    // Restore console.error after each test
    afterEach(() => {
      console.error = originalConsoleError;
    });
    tests.forEach((t) => {
      test(t.description, t.func);
    });
  });
};
