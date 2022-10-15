const core = require("@actions/core");
const github = require("@actions/github");
const git = require("./git");
const ChangeLog = require("./changelog");
const DateString = require("./dateString");

function getPrevVersionName() {
  const preVersionNameInput = core.getInput("prev-version-name");
  if ("env.PREV_VERSION_NAME" === preVersionNameInput) {
    return process.env.PREV_VERSION_NAME;
  }
  return preVersionNameInput;
}

function getNextVersionName() {
  const prefix = core.getInput("tag-prefix");
  const nextVersionNameInput = core.getInput("target-version");
  if ("env.AUTO_VERSION" === nextVersionNameInput) {
    return prefix + process.env.AUTO_VERSION;
  }
  return prefix + nextVersionNameInput;
}

async function run() {
  try {
    const octokit = github.getOctokit(core.getInput("github-token"));
    const prevVersion = getPrevVersionName();
    const nextVersion = getNextVersionName();
    const prevVersionSha = git.tagToSha(octokit, prevVersion);
    const commits = await git.commits(octokit, prevVersionSha);
    core.info("Fetched " + commits.length + " from GitHub");

    const issuesReferences = [
      ...new Set(
        [].concat(...commits.map((commit) => commit.issuesReferences()))
      ),
    ];
    core.info(
      "Extracted " + issuesReferences.length + " issue references from commits"
    );

    const issues = await git.issues(octokit, issuesReferences);
    core.info("Fetched " + issues.length + " issues from GitHub");

    const changelog = new ChangeLog(
      new DateString(new Date()).asString(),
      prevVersion,
      nextVersion,
      commits,
      issues
    ).asString();

    core.setOutput("release-notes", changelog);

    if (core.getBooleanInput("dry-run")) {
      return;
    }
    let release;
    if (core.getBooleanInput("draft")) {
      release = await git.draft(octokit, nextVersion, changelog);
    } else {
      release = await git.release(octokit, nextVersion, changelog);
    }
    core.setOutput("release-id", release.id);
    core.setOutput("upload-url", release.upload_url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
