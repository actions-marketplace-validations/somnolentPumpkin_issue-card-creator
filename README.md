# Issue Card Creator

This is a GitHub Action written in JavaScript. It allows you to automatically create a project card for an issue when it's created. It supports both repo-level projects and org-level projects.

The `main.yml` has an `actions` input, which allows you to customize which issue labels should map to which project/org/column. Here's an example that uses both repo-level and org-level projects:
```
with:
  actions: '{"data": [
    {
      "label": "test",
      "project": "Ultra Project",
      "project_type": "repo",
      "column": "To-Do",
      "repo": "super-repo"
    },
    {
      "label": "wontfix",
      "project": "Mega Project",
      "project_type": "org",
      "column": "Icebox",
      "org": "ultra-important-org"
    }
  ]}'
  ```
  
  
  
  ## Full Example main.yml
  ```
  on:
  issues:
    types: [opened]

jobs:
  issue_creator_job:
    runs-on: ubuntu-latest
    name: Issue card handler
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Issue Card Creator
        uses: ./action
        id: hello
        with:
          actions: '{"data": [
            {
              "label": "test",
              "project": "Ultra Project",
              "project_type": "repo",
              "column": "To-Do",
              "repo": "super-repo"
            },
            {
              "label": "wontfix",
              "project": "Mega Project",
              "project_type": "org",
              "column": "Icebox",
              "org": "mega-important-org"
            }
          ]}'
```
