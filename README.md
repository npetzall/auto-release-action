[![Release](https://github.com/npetzall/auto-release-action/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/npetzall/auto-release-action/actions/workflows/release.yml)
[![Testing](https://github.com/npetzall/auto-release-action/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/npetzall/auto-release-action/actions/workflows/main.yml)
[![Check dist/](https://github.com/npetzall/auto-release-action/actions/workflows/check-dist.yml/badge.svg?branch=main)](https://github.com/npetzall/auto-release-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/npetzall/auto-release-action/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/npetzall/auto-release-action/actions/workflows/codeql-analysis.yml)


# Auto Release Action

Idea is to provide a changelog similar to [shipkit-changelog](https://github.com/shipkit/shipkit-changelog)  

shipkit-changelog can be used together with [shipkit-auto-version](https://github.com/shipkit/shipkit-auto-version)  

The same way this action is supposed to work together with [auto-version-action](https://github.com/npetzall/auto-version-action)  

## Inputs

## `github-token`

**Required** normally this should be `${{ secrets.GITHUB_TOKEN }}` so that the repository can be accessed.

## `dry-run`

Skip draft/release

**Default** false

## `prev-version-name`

Starting point for changes to be included in changelog, tag name.

**Default** `env.PREV_VERSION_NAME` (exported by auto-version-action)

## `tag-prefix`

Used so that versions can be extracted from tags.

**Default** `v`

## `target-version`

Version to be released

**Default** `env.AUTO_VERSION` (exported by auto-version-action)

## `draft`

Instead of a release, create draft if missing or update the latest draft

**Default** false

## Outputs

## `release-notes`

The generated release notes if you want to use it in other actions

## `release-id`

Id of the release that has been created if you want to use it in other actions

## `upload-url`

Upload url if you want to add additional resources to the release

## Example usage

### On it's own

```yaml
    - uses: npetzall/auto-release-action@[sha]
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        prev-version-name: [tag name]
        target-version: [the version to release]
```

### With auto version
```yaml
  - uses: npetzall/auto-version-action@[sha]
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
  - uses: npetzall/auto-release-action@[sha]
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```
