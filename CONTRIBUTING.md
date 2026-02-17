# Contributing to Core2Cover Site

## How Changes Are Tracked

### Version Control with Git

**Yes, all changes you make in this repository ARE tracked** through Git version control. Here's how:

#### 1. Local Changes
When you modify files in the repository:
```bash
# Check what files have changed
git status

# See the actual changes you made
git diff
```

#### 2. Staging Changes
Before committing, you need to stage your changes:
```bash
# Stage specific files
git add <filename>

# Or stage all changed files
git add .
```

#### 3. Committing Changes
Save your staged changes with a descriptive message:
```bash
git commit -m "Description of what you changed"
```

#### 4. Pushing to GitHub
Share your changes with the remote repository:
```bash
# Push to your current branch
git push

# Or push to a specific branch
git push origin <branch-name>
```

### Branch Structure

- **main branch**: The primary branch containing production-ready code
- **feature branches**: Create separate branches for new features or fixes
  ```bash
  git checkout -b feature/your-feature-name
  ```

### Checking Your Changes

#### View Commit History
```bash
# See recent commits
git log --oneline -10

# See all commits with graph
git log --all --oneline --graph
```

#### Compare Branches
```bash
# See differences between your branch and main
git diff main..your-branch-name
```

#### Check Remote Status
```bash
# See if your local branch is up to date
git status

# View remote repositories
git remote -v
```

## Deployment

This project is configured for deployment on **Vercel**. Changes pushed to specific branches may automatically trigger deployments:

- Changes to `main` typically deploy to production
- Pull requests create preview deployments
- You can monitor deployments in your Vercel dashboard

## Development Workflow

### 1. Make Changes Locally
```bash
# Start development server
npm run dev

# Make your code changes
# Test your changes at http://localhost:3000
```

### 2. Verify Changes
```bash
# Run linter
npm run lint

# Build the project
npm run build
```

### 3. Commit and Push
```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "Add feature: description"

# Push to GitHub
git push
```

### 4. Create Pull Request
- Go to GitHub repository
- Create a Pull Request from your branch to main
- Request review from team members
- Merge after approval

## Best Practices

### Commit Messages
Write clear, descriptive commit messages:
- ✅ Good: "Add user authentication with JWT"
- ✅ Good: "Fix navigation menu on mobile devices"
- ❌ Bad: "update stuff"
- ❌ Bad: "changes"

### Before Pushing
Always check what you're about to commit:
```bash
# Review staged changes
git diff --staged

# Review commit before pushing
git log -1
```

### Keeping Track of Your Changes

1. **Use meaningful branch names**
   ```bash
   git checkout -b feature/add-payment-integration
   git checkout -b fix/mobile-navigation-bug
   ```

2. **Commit frequently** with logical chunks of work

3. **Pull latest changes** before starting new work
   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-new-branch
   ```

4. **Check your work before pushing**
   ```bash
   git status
   git log --oneline -5
   git diff origin/main
   ```

## Summary

**All changes made in this repository ARE tracked** through Git. Every modification, addition, or deletion is:
- Recorded in Git history
- Associated with your commits
- Pushed to GitHub for team visibility
- Potentially deployed automatically via Vercel

To verify your changes are tracked, run `git log` to see your commit history.
