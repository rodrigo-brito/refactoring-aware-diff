# Refactoring Aware Diff - Github Action

This action extract project refactorings with [RefDiff](https://github.com/aserg-ufmg/RefDiff) and provides a custom visualization of refactorings in Github Review with a [Chrome Plugin](https://github.com/rodrigo-brito/refactoring-aware-review).

## Example usage

```yaml
steps:
  - name: Git Checkout
    uses: actions/checkout@v2
    with:
      fetch-depth: 0

  - name: Refactoring Extraction
    env:
      LANGUAGE: ${{ github.event.repository.language }}
      REV_BEFORE: ${{ github.event.pull_request.base.sha }}
      REV_AFTER: ${{ github.event.pull_request.head.sha }}
    uses: rodrigo-brito/refdiff-github-action@master
```

### Demo Project

We provided a working project with Refactoring Aware Diff installed: https://github.com/rodrigo-brito/refactoring-aware-review-example

### Preview

![image](https://user-images.githubusercontent.com/7620947/74206000-61ced780-4c58-11ea-8478-46e02bd059e9.png)
