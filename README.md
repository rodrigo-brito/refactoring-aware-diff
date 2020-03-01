# Refactoring-Aware Review

![Tests and Lint](https://github.com/rodrigo-brito/refactoring-aware-review/workflows/Tests%20and%20Lint/badge.svg)
![Chrome Web Store](https://img.shields.io/chrome-web-store/v/bclbegekihgpelanbbleaceefgmekjdd)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

Adds refactoring annotations to GitHub diffs.

## Installation

<a href="https://chrome.google.com/webstore/detail/refactoring-aware-diff/bclbegekihgpelanbbleaceefgmekjdd">
<img width="300px" src="https://user-images.githubusercontent.com/7620947/75341916-26e1bc00-5874-11ea-9526-463ddf1e7f82.png" />
</a>

## Usage

To detect refactorings in your repository, you should set up [Github Actions](https://help.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow).

Basically, you need to create a YAML file in the `.github/workflows` folder with the following content. An example of a configured project can be found in the [refactorings](https://github.com/rodrigo-brito/refactoring-aware-review/tree/refactorings) branch.

Example of workflow file: `.github/workflows/workflow.yml`:

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

## Example of refactoring-aware diff in Github

You can see some examples of refactorings here, without configure Github Actions: https://github.com/rodrigo-brito/refactoring-aware-review/pull/3/commits

## Preview

![image](https://user-images.githubusercontent.com/7620947/74206000-61ced780-4c58-11ea-8478-46e02bd059e9.png)
