# Refactoring-Aware Diff

Adds refactoring annotations to GitHub diffs.

### Installation

-   Download or clone repository your computer

![image](https://user-images.githubusercontent.com/7620947/74889844-0049ef80-5361-11ea-8a38-f23cd5000643.png)

-   Open Chrome Extensions (chrome://extensions/) page and load plugin with `Load Unpacked` button:

![image](https://user-images.githubusercontent.com/7620947/74890021-882ff980-5361-11ea-8fd1-c7ab4e75f336.png)

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
      uses: rodrigo-brito/refdiff-github-action@master
```

### Demo Project

Example of project with Refactoring Aware Review: https://github.com/rodrigo-brito/refactoring-aware-review-example/pull/1/files

## Preview

![image](https://user-images.githubusercontent.com/7620947/74206000-61ced780-4c58-11ea-8478-46e02bd059e9.png)
