const core = require("@actions/core");
const { context } = require("@actions/github");

const baseOptions = {
  owner: context.repo.owner,
  repo: context.repo.repo,
};

class Commit {
  constructor(author, message) {
    this.author = author;
    this.message = message;
  }

  issuesReferences() {
    return Array.from(this.message.matchAll(/#(\d+)/g), (m) => parseInt(m[1]));
  }
}

class Issue {
  constructor(id, url, title) {
    this.id = id;
    this.url = url;
    this.title = title;
  }

  asString() {
    return " - " + this.title + " [(#" + this.id + ")](" + this.url + ")";
  }
}

class Draft {
  constructor(release) {
    this.id = release.id;
    this.created = Date.parse(release.created_at);
  }
}

const commits = async (github, tag) => {
  const options = { ...baseOptions };
  if (tag && tag.trim().length > 0) {
    options.sha = tag.trim();
  }
  return github
    .paginate(github.rest.repos.listCommits, options)
    .then((commits) => {
      return commits.map(
        (commit) => new Commit(commit.commit.author.name, commit.commit.message)
      );
    });
};

const issues = async (github, issuesReferences) => {
  if (!issuesReferences || issuesReferences.length === 0) {
    return [];
  }
  const minId = Math.min(...issuesReferences);
  core.info("Will break pagination at issue #" + minId);
  const options = {
    ...baseOptions,
    state: "closed",
    sort: "created",
    direction: "desc",
    filter: "all",
    per_page: 100,
  };
  return github
    .paginate(github.rest.issues.listForRepo, options, (response, done) => {
      if (response.data.find((issue) => issue.number <= minId)) {
        core.info(
          "Found issue with lowest number, signaling done with pagination"
        );
        done();
      }
      return response.data;
    })
    .then((issues) => {
      core.info("GitHub has returned " + issues.length + " issues");
      return issues
        .filter((issue) => issuesReferences.includes(issue.number))
        .map((issue) => new Issue(issue.number, issue.html_url, issue.title));
    });
};

const draft = async (github, nextVersion, releaseNote) => {
  const drafts = await github.paginate(
    github.rest.repos.listReleases,
    { ...baseOptions, per_page: 100 },
    (response) =>
      response.data
        .filter((release) => release.draft)
        .map((release) => new Draft(release))
  );
  if (drafts.length > 0) {
    const draft = drafts.sort((a, b) => b.created - a.created)[0];
    core.info("Updating draft with id: " + draft.id + ", to " + nextVersion);
    return await github.rest.repos
      .updateRelease({
        ...baseOptions,
        release_id: draft.id,
        tag_name: nextVersion,
        target_commitish: context.sha,
        name: nextVersion,
        body: releaseNote,
        draft: true,
      })
      .then((response) => response.data);
  } else {
    core.info("Creating draft for: " + nextVersion);
    return await github.rest.repos
      .createRelease({
        ...baseOptions,
        tag_name: nextVersion,
        target_commitish: context.sha,
        name: nextVersion,
        body: releaseNote,
        draft: true,
        prerelease: false,
      })
      .then((response) => response.data);
  }
};

const release = async (github, nextVersion, releaseNote) => {
  core.info("Creating Release: " + nextVersion);
  return await github.rest.repos
    .createRelease({
      ...baseOptions,
      tag_name: nextVersion,
      target_commitish: context.sha,
      name: nextVersion,
      body: releaseNote,
      draft: false,
      prerelease: false,
    })
    .then((response) => response.data);
};

exports.commits = commits;
exports.issues = issues;
exports.draft = draft;
exports.release = release;

exports.Commit = Commit;
exports.Issue = Issue;
exports.Draft = Draft;
