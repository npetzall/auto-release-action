const { context } = require("@actions/github");

class Commit {
    constructor(author, message) {
        this.author = author;
        this.message = message;
    }

    issuesReferences() {
        return Array.from(this.message.matchAll(/#\d+/g), m => parseInt(m[0].slice(1)))
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

const commits = async (github, tag) => {
    const options = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }
    if (tag && tag.trim().length > 0) {
        options.sha = tag.trim();
    }
    return github
        .paginate(github.rest.repos.listCommits, options)
        .then(commits => {
            return commits.map(commit => new Commit(commit.commit.author.name, commit.commit.message));
        });
}

const issues = async (github, issuesReferences) => {
    if (!issuesReferences || issuesReferences.length === 0) {
        return [];
    }
    const minId = Math.min(...issuesReferences);
    const options = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: "closed",
        sort: "created",
        direction: "desc",
        filter: "all",
        per_page: 100
    }
    return github
        .paginate(
            github.rest.issues.list,
            options,
            (response, done) => {
                if (response.data.find((issue) => issue.number <= minId)) {
                    done();
                }
                return response.data;
            }
        ).then(issues => {
            return issues.filter(issue => issuesReferences.includes(issue.number)).map(issue => new Issue(issue.number, issue.html_url, issue.title));
        });
}

exports.commits = commits;
exports.issues = issues;

exports.Commit =  Commit;
exports.Issue = Issue;