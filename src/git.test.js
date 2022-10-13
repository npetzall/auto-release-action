const git = require("./git");
const { Issue } = require("./git");

const listCommitsSingleExample = [
  {
    commit: {
      url: "https://api.github.com/repos/octocat/Hello-World/git/commits/6dcb09b5b57875f334f61aebed695e2e4193db5e",
      author: {
        name: "Monalisa Octocat",
        email: "support@github.com",
        date: "2011-04-14T16:00:49Z",
      },
      message: "Fix all the bugs",
    },
    parents: [
      {
        url: "https://api.github.com/repos/octocat/Hello-World/commits/6dcb09b5b57875f334f61aebed695e2e4193db5e",
        sha: "6dcb09b5b57875f334f61aebed695e2e4193db5e",
      },
    ],
  },
];

const simpleListCommitWithIssueReference = [
  {
    commit: {
      url: "https://api.github.com/repos/octocat/Hello-World/git/commits/6dcb09b5b57875f334f61aebed695e2e4193db5e",
      author: {
        name: "Monalisa Octocat",
      },
      message: "Fix all the bugs fixes #2",
    },
    parents: [
      {
        url: "https://api.github.com/repos/octocat/Hello-World/commits/6dcb09b5b57875f334f61aebed695e2e4193db5e",
        sha: "6dcb09b5b57875f334f61aebed695e2e4193db5e",
      },
    ],
  },
];

const simpleIssueList = [
  {
    html_url: "https://github.com/octocat/Hello-World/issues/1347",
    number: 1347,
    title: "Found a bug",
    pull_request: {
      url: "https://api.github.com/repos/octocat/Hello-World/pulls/1347",
      html_url: "https://github.com/octocat/Hello-World/pull/1347",
      diff_url: "https://github.com/octocat/Hello-World/pull/1347.diff",
      patch_url: "https://github.com/octocat/Hello-World/pull/1347.patch",
    },
  },
];

describe("commits", () => {
  test("commits to simple commits", async () => {
    const github = {
      paginate() {
        return new Promise((resolve) => {
          resolve(listCommitsSingleExample);
        });
      },
      rest: {
        repos: {
          listCommits: {},
        },
      },
    };
    const commits = await git.commits(github);
    expect(commits).toHaveLength(1);
    expect(commits[0]).toEqual({
      author: "Monalisa Octocat",
      message: "Fix all the bugs",
    });
  });
  test("commit with tickets", async () => {
    const github = {
      paginate() {
        return new Promise((resolve) => {
          resolve(simpleListCommitWithIssueReference);
        });
      },
      rest: {
        repos: {
          listCommits: {},
        },
      },
    };
    const commits = await git.commits(github);
    const issuesReferences = commits[0].issuesReferences();
    expect(issuesReferences).toHaveLength(1);
    expect(issuesReferences[0]).toBe(2);
  });
  test("use tag when present", async () => {
    const github = {
      tag: undefined,
      paginate() {
        github.tag = arguments[1].sha;
        return new Promise((resolve) => {
          resolve(simpleListCommitWithIssueReference);
        });
      },
      rest: {
        repos: {
          listCommits: {},
        },
      },
    };
    await git.commits(github, "v0.0.1");
    expect(github.tag).toBe("v0.0.1");
  });
  test("skip tag when undefined", async () => {
    const github = {
      tag: "isSet",
      paginate() {
        github.tag = arguments[1].sha;
        return new Promise((resolve) => {
          resolve(simpleListCommitWithIssueReference);
        });
      },
      rest: {
        repos: {
          listCommits: {},
        },
      },
    };
    await git.commits(github);
    expect(github.tag).toBeUndefined();
  });
});

describe("issues", () => {
  test("fetchIssues", async () => {
    const github = {
      paginate() {
        return new Promise((resolve) => {
          resolve(simpleIssueList);
        });
      },
      rest: {
        issues: {
          listIssues: {},
        },
      },
    };

    const issues = await git.issues(github, [1347]);
    expect(issues).toHaveLength(1);
  });
  test("fetchIssue, no issue list", async () => {
    const github = {
      paginate() {
        return new Promise((resolve) => {
          resolve(simpleIssueList);
        });
      },
      rest: {
        issues: {
          listIssues: {},
        },
      },
    };

    const issues = await git.issues(github, []);
    expect(issues).toHaveLength(0);
  });
  test("fetch calls done early", async () => {
    const github = {
      done: false,
      self: this,
      paginate() {
        const fn = arguments[2];
        fn(
          {
            data: [
              {
                number: "1",
              },
            ],
          },
          () => (github.done = true)
        );
        return new Promise((resolve) => {
          resolve(simpleIssueList);
        });
      },
      rest: {
        issues: {
          listIssues: {},
        },
      },
    };
    const issues = await git.issues(github, [1347]);
    expect(github.done).toBeTruthy();
    expect(issues).toHaveLength(1);
  });
  test("IssueObject asString", async () => {
    expect(
      new Issue(
        5,
        "https://github.com/owner/repo/issues/5",
        "Something needs doing"
      ).asString()
    ).toBe(
      " - Something needs doing [(#5)](https://github.com/owner/repo/issues/5)"
    );
  });
});
