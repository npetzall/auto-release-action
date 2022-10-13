module.exports = class DateString {
  constructor(date) {
    this.date = date;
  }

  asString() {
    return (
      this.date.getUTCFullYear() +
      "-" +
      (this.date.getUTCMonth() + 1).toString().padStart(2, "0") +
      "-" +
      this.date.getUTCDate().toString().padStart(2, "0")
    );
  }
};
