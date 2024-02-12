# Jira Transition

This action allows transitioning tickets in Jira Server.

## Build

After changing the action's code, the action must be rebuilt and packaged via `yarn all` and the changes in the `dist` folder must be commited.

## Release

After commiting a new version, you have to move the Major version tag or create a new one, as described in the [GitHub Actions docs](https://docs.github.com/en/actions/creating-actions/about-actions#using-tags-for-release-management): `git tag -fa v1`.

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below.
For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `transition_name` - Name of the transition to be executed
- `service_base_url` - The base url of the transition service, must include basic authentication credentials
- `search_pattern` (optional) - Pattern that should be used to find issues in Git log (default: `KNUTH-[0-9]+`)
- `ignore_pattern` (optional) - Pattern that excludes issues references in this line of the commit message (default: `refs?`)
- `commit_depth` (optional) - Defines how many Git commits should be inspected (default: `10`)
- `additional_jql` (optional) - Defines JQL that should be included at the end of the JQL query (default: `AND status NOT IN ('Ready for Test', 'Ready for Prod-Deploy', 'Closed')`)

### Example workflow

```yaml
name: Transition Issues

on: push

jobs:
  transition-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 5
      - name: Transition Jira Issues
        uses: meisterplan/actions-jiratransition@master
        with:
          transition_name: In Build
          service_base_url: https://jira:password@jira-transition-service.example.tld
```
