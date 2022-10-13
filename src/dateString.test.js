const DateString = require("./dateString");

describe("DateString", () => {
  test("TimeZone shift changes year", () => {
    expect(
      new DateString(
        new Date("December 31, 1975, 23:15:30 GMT-11:00")
      ).asString()
    ).toBe("1976-01-01");
  });
  test("Format as YYYY-mm-dd", () => {
    expect(
      new DateString(
        new Date("December 31, 1975, 23:15:30 GMT+11:00")
      ).asString()
    ).toBe("1975-12-31");
  });
});
