const { context } = require("@actions/github");

const template =
  "<sup><sup>*Changelog generated by [auto-release-action](https://github.com/npetzall/auto-release-action)*</sup></sup>\n" +
  "\n" +
  "#### @version@\n" +
  " - @date@ - [@commitCount@ commit(s)](@commitsLink@) by @contributors@\n" +
  "@improvements@";

const createCommitsLink = (prevVersion, nextVersion) => {
  if (!prevVersion) {
    return (
      "https://github.com/" +
      context.repo.owner +
      "/" +
      context.repo.repo +
      "/commits/" +
      nextVersion
    );
  } else {
    return (
      "https://github.com/" +
      context.repo.owner +
      "/" +
      context.repo.repo +
      "/compare/" +
      prevVersion +
      "..." +
      nextVersion
    );
  }
};

const createImprovements = (issues) => {
  if (!issues || issues.length == 0) {
    return " - No notable improvements. No pull requests (issues) were referenced from commits.";
  }
  return issues.map((issue) => issue.asString()).join("\n");
};

module.exports = class Changelog {
  constructor(date, prevVersion, nextVersion, commits, issues) {
    this.date = date;
    this.prevVersion = prevVersion;
    this.nextVersion = nextVersion;
    this.commits = commits;
    this.issues = issues;
  }

  asString() {
    return template
      .replace("@version@", this.nextVersion)
      .replace("@date@", this.date)
      .replace("@commitCount@", this.commits.length)
      .replace(
        "@commitsLink@",
        createCommitsLink(this.prevVersion, this.nextVersion)
      )
      .replace(
        "@contributors@",
        [...new Set(this.commits.map((commit) => commit.author))].join(", ")
      )
      .replace("@improvements@", createImprovements(this.issues));
  }
};

//@repoUrl@/compare/@previousRev@...@newRev@
//When no previous: https://github.com/contentmap/ods-stream/commits/v0.0.0
//With previous: https://github.com/contentmap/ods-stream/compare/v0.0.2...v0.0.3