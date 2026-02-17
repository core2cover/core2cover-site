# Git Quick Reference - Checking Your Changes

## Quick Answer
**YES, all changes you make in this repository are tracked by Git!**

## Essential Commands

### Check What Changed
```bash
# See which files you modified
git status

# See the actual code changes
git diff

# See changes in staged files
git diff --staged
```

### View Your Commits
```bash
# See your recent commits
git log --oneline -10

# See detailed commit history
git log

# See commits with file changes
git log --stat
```

### Check If Changes Are Pushed
```bash
# See if your local branch is ahead/behind remote
git status

# Compare local with remote
git diff origin/main

# List all branches (local and remote)
git branch -a
```

### Track Your Workflow

1. **Before you start working:**
   ```bash
   git status          # Should show "working tree clean"
   git pull           # Get latest changes from GitHub
   ```

2. **While you work:**
   ```bash
   git status         # See what you've changed
   git diff          # See exact changes
   ```

3. **Saving your work:**
   ```bash
   git add .                           # Stage all changes
   git commit -m "Your message here"  # Save changes locally
   git push                           # Upload to GitHub
   ```

4. **Verify it's saved:**
   ```bash
   git status        # Should show "nothing to commit"
   git log -1        # See your latest commit
   ```

## Common Questions

### "Did my changes get saved?"
```bash
git log --oneline -5    # Check if your commit is there
```

### "Are my changes on GitHub?"
```bash
git status              # Check if ahead of origin
git log origin/main..HEAD  # See unpushed commits
```

### "What did I change?"
```bash
git diff               # Changes not yet staged
git diff --staged      # Changes ready to commit
git show              # Last commit changes
```

### "Can I see all my changes compared to main?"
```bash
git diff main         # If you're on a different branch
```

## Visual Confirmation

After pushing, you can visually confirm on GitHub:
1. Go to https://github.com/core2cover/core2cover-site
2. Check the "Commits" tab
3. Look for your branch in "Branches"
4. View your Pull Request (if created)

## Remember
- ✅ Git tracks EVERYTHING you commit
- ✅ Changes must be committed AND pushed to appear on GitHub
- ✅ Use `git status` and `git log` frequently
- ✅ Always write clear commit messages
