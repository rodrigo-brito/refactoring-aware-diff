# Refactoring-Aware Diff

![Tests and Lint](https://github.com/rodrigo-brito/refactoring-aware-review/workflows/Tests%20and%20Lint/badge.svg)
![Chrome Web Store](https://img.shields.io/chrome-web-store/v/bclbegekihgpelanbbleaceefgmekjdd)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

Adds refactoring annotations to GitHub diffs.

### Installation

<a href="https://chrome.google.com/webstore/detail/refactoring-aware-diff/bclbegekihgpelanbbleaceefgmekjdd">
<img width="300px" src="https://user-images.githubusercontent.com/7620947/75341916-26e1bc00-5874-11ea-9526-463ddf1e7f82.png" />
</a>

### Usage

You can settup the Github Actions includinding this step in the pipeline:

```yaml
steps:
    - name: Git Checkout
      uses: actions/checkout@v2
      with:
          fetch-depth: 0

    - name: Refactoring Extraction
      id: ref-extract
      env:
          LANGUAGE: ${{ github.event.repository.language }}
          REV_BEFORE: ${{ github.event.pull_request.base.sha }}
          REV_AFTER: ${{ github.event.pull_request.head.sha }}
      uses: rodrigo-brito/refactoring-aware-review@action
```

### Demo Project

Example of project with Refactoring Aware Review: https://github.com/rodrigo-brito/refactoring-aware-review-example/pull/1/files

## Preview

![image](https://user-images.githubusercontent.com/7620947/74206000-61ced780-4c58-11ea-8478-46e02bd059e9.png)
