# Pushing to Upstream Demo Branch

This document explains how to push this demo repository to the original core2cover repository's demo branch.

## Prerequisites

- Git installed on your system
- Write access to https://github.com/core2cover/core2cover-site repository
- Properly configured SSH keys or HTTPS credentials for GitHub

## Setup

The upstream remote has been configured to point to the original repository:

```bash
git remote add upstream https://github.com/core2cover/core2cover-site.git
```

You can verify the remotes with:

```bash
git remote -v
```

Expected output:
```
origin    https://github.com/rihan-png/core2cover-site (fetch)
origin    https://github.com/rihan-png/core2cover-site (push)
upstream  https://github.com/core2cover/core2cover-site.git (fetch)
upstream  https://github.com/core2cover/core2cover-site.git (push)
```

## Manual Push to Demo Branch

To push the current branch to the upstream demo branch:

```bash
# Make sure you're on the branch you want to push
git checkout copilot/push-demo-repo-to-original

# Push to upstream demo branch
git push upstream copilot/push-demo-repo-to-original:demo
```

Or to push the main branch to demo:

```bash
# Make sure you're on main
git checkout main

# Push main to upstream demo branch
git push upstream main:demo
```

## Using GitHub Actions (Automated)

A GitHub Actions workflow has been created in `.github/workflows/push-to-demo.yml` to automate pushing to the upstream demo branch.

To use it:

1. Add a GitHub secret named `UPSTREAM_TOKEN` with a Personal Access Token that has write access to the upstream repository
2. The workflow will automatically push to the demo branch when changes are pushed to main

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

1. For HTTPS: Make sure you have a valid GitHub Personal Access Token
2. For SSH: Ensure your SSH keys are properly configured

### Force Push

If you need to force push (use with caution):

```bash
git push upstream main:demo --force
```

**Warning**: Force pushing will overwrite the remote branch. Only use this if you're certain about what you're doing.

## References

- Original repository: https://github.com/core2cover/core2cover-site
- Demo branch: https://github.com/core2cover/core2cover-site/tree/demo
