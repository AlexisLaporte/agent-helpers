---
name: Git Worktrees
description: Manage multiple Git working trees. Use when user wants to work on multiple branches simultaneously, review PRs while developing, or maintain isolated workspaces.
source: base
---

# Git Worktrees

Work on multiple branches simultaneously with isolated Git working trees.

## When to Use

Use this skill when the user wants to:
- Work on multiple branches at the same time
- Review PRs without stashing current work
- Test changes across different branches
- Maintain separate build directories
- Run parallel development tasks
- Keep main branch always available
- Avoid constant branch switching

## What are Worktrees?

Git worktrees allow you to have multiple working directories from a single repository, each checked out to different branches. This eliminates the need to clone the repository multiple times or constantly switch branches.

## Basic Usage

### Add Worktree

```bash
# Create worktree for existing branch
git worktree add ../project-feature feature-branch

# Create worktree with new branch
git worktree add ../project-hotfix -b hotfix/bug-123

# Create worktree from remote branch
git worktree add ../project-review origin/pr-456
```

### List Worktrees

```bash
git worktree list

# Output:
# /home/user/project        abc123 [main]
# /home/user/project-feature def456 [feature-branch]
# /home/user/project-hotfix  ghi789 [hotfix/bug-123]
```

### Remove Worktree

```bash
# Remove worktree (must be outside it)
git worktree remove ../project-feature

# Or manually delete directory and prune
rm -rf ../project-feature
git worktree prune
```

### Move Worktree

```bash
git worktree move ../project-feature ../new-location
```

## Common Patterns

### Review PR Without Switching

```bash
# Current work in main worktree
cd ~/project
# Working on feature-a...

# Review PR in separate worktree
git worktree add ../project-pr-review origin/pull/123/head
cd ../project-pr-review
npm install
npm test
# Review code...

# Clean up when done
cd ~/project
git worktree remove ../project-pr-review
```

### Parallel Development

```bash
# Main development
cd ~/project
git worktree add ../project-feature-a -b feature-a

# Urgent hotfix needed
git worktree add ../project-hotfix -b hotfix/urgent

# Work on both simultaneously
cd ../project-feature-a
# Develop feature...

cd ../project-hotfix
# Fix bug...
git commit -am "Fix urgent bug"
git push origin hotfix/urgent

# Continue feature work
cd ../project-feature-a
```

### Keep Main Always Clean

```bash
# Setup structure
cd ~/project
git worktree add ../project-main main        # Read-only reference
git worktree add ../project-dev -b develop   # Active development

# Always have clean main for quick access
cd ../project-main
git pull

# Do all work in dev worktree
cd ../project-dev
```

## Advanced Patterns

### Automated Worktree Setup

```bash
#!/bin/bash
# create-worktree.sh

BRANCH=$1
BASE=${2:-main}

if [ -z "$BRANCH" ]; then
  echo "Usage: create-worktree.sh <branch-name> [base-branch]"
  exit 1
fi

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")

# Create worktree in parent directory
WORKTREE_PATH="${REPO_ROOT}/../${REPO_NAME}-${BRANCH}"

git worktree add "$WORKTREE_PATH" -b "$BRANCH" "$BASE"
cd "$WORKTREE_PATH"

# Run setup if needed
if [ -f "package.json" ]; then
  npm install
fi

echo "Worktree created at: $WORKTREE_PATH"
```

Usage:
```bash
./create-worktree.sh feature-login
./create-worktree.sh hotfix-security develop
```

### Worktree Per Pull Request

```bash
#!/bin/bash
# pr-worktree.sh

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
  echo "Usage: pr-worktree.sh <pr-number>"
  exit 1
fi

# Fetch PR branch
git fetch origin pull/$PR_NUMBER/head:pr-$PR_NUMBER

# Create worktree
git worktree add ../project-pr-$PR_NUMBER pr-$PR_NUMBER

cd ../project-pr-$PR_NUMBER
npm install

echo "PR #$PR_NUMBER worktree ready"
```

### Clean All Worktrees

```bash
#!/bin/bash
# clean-worktrees.sh

git worktree list | tail -n +2 | while read line; do
  WORKTREE_PATH=$(echo $line | awk '{print $1}')
  echo "Removing $WORKTREE_PATH"
  git worktree remove "$WORKTREE_PATH" --force
done

git worktree prune
```

## Directory Structure

Recommended organization:

```
~/projects/
├── myproject/              # Main repository (main branch)
├── myproject-develop/      # Development worktree
├── myproject-feature-a/    # Feature A worktree
├── myproject-feature-b/    # Feature B worktree
└── myproject-hotfix/       # Hotfix worktree
```

## Worktree with Build Artifacts

```bash
# Keep build artifacts separate
git worktree add ../project-prod -b production
cd ../project-prod
npm install
npm run build
# Build stays here, doesn't pollute main worktree

cd ~/project  # Back to development
# Clean development environment
```

## Best Practices

### Do:
- Use descriptive worktree names
- Clean up worktrees when done
- Keep worktrees in consistent locations
- Use worktrees for long-running branches
- Run `git worktree prune` periodically

### Don't:
- Create too many worktrees (manage complexity)
- Forget to remove old worktrees
- Mix worktrees with manual clones
- Edit `.git/worktrees` manually

## Common Commands

```bash
# Add worktree
git worktree add <path> [<branch>]

# Add worktree with new branch
git worktree add <path> -b <new-branch> [<start-point>]

# List worktrees
git worktree list

# List with details
git worktree list --porcelain

# Remove worktree
git worktree remove <path>

# Force remove (even with uncommitted changes)
git worktree remove <path> --force

# Move worktree
git worktree move <old-path> <new-path>

# Clean up stale references
git worktree prune

# Lock worktree (prevent removal)
git worktree lock <path>

# Unlock worktree
git worktree unlock <path>
```

## Troubleshooting

### "worktree already exists"

```bash
# Clean stale references
git worktree prune

# Or remove manually
rm -rf .git/worktrees/<name>
```

### Cannot remove worktree

```bash
# Force removal
git worktree remove <path> --force

# Or manually
rm -rf <path>
git worktree prune
```

### Branch checked out in another worktree

```bash
# Error: branch is already checked out
# Solution: Use different branch or remove other worktree
git worktree list  # Find where it's checked out
git worktree remove <other-path>
```

## Integration with Scripts

### VS Code Integration

```bash
# Open worktree in new VS Code window
code ../project-feature
```

### Tmux Integration

```bash
# Create tmux session per worktree
tmux new-session -s feature-a -c ~/project-feature-a
tmux new-session -s feature-b -c ~/project-feature-b
```

### Fish Shell Function

```fish
function gwt
    set branch $argv[1]
    set repo (basename (git rev-parse --show-toplevel))
    set worktree_path "../$repo-$branch"

    git worktree add $worktree_path -b $branch
    cd $worktree_path
    npm install
end
```

Usage:
```bash
gwt feature-login
```

## Comparison to Alternatives

### vs. Git Stash
- **Stash**: Temporary, single context
- **Worktrees**: Persistent, multiple contexts

### vs. Multiple Clones
- **Clones**: Duplicate `.git` directory, more disk space
- **Worktrees**: Shared `.git`, less disk space

### vs. Branch Switching
- **Switching**: Rebuilds, loses context
- **Worktrees**: Instant switch, preserves context

## Use Cases

### Code Review Workflow
```bash
# Reviewer
git worktree add ../project-review origin/feature-branch
cd ../project-review
# Review and test
git worktree remove ../project-review
```

### Release Management
```bash
git worktree add ../project-release release/v2.0
cd ../project-release
# Prepare release
# Main development continues in main worktree
```

### Testing Across Branches
```bash
git worktree add ../project-main main
git worktree add ../project-develop develop

cd ../project-main
npm test  # Test main

cd ../project-develop
npm test  # Test develop
```

## Resources

- Git documentation: https://git-scm.com/docs/git-worktree
- Pro Git book: https://git-scm.com/book/en/v2
- Worktree best practices: https://morgan.cugerone.com/blog/workarounds-to-git-worktree-using-bare-repository-and-cannot-fetch-remote-branches/
