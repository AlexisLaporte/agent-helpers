# Contributing to Agent Helpers

Thank you for your interest in contributing! This guide will help you understand how to contribute effectively to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Contribution Levels](#contribution-levels)
- [Getting Started](#getting-started)
- [Contribution Workflow](#contribution-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

If you find a bug:
1. Check if it's already reported in [Issues](https://github.com/AlexisLaporte/agent-helpers/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome:
1. Check existing issues and discussions first
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions you've considered
   - Any additional context

### Contributing Code

Contributions can be made at three levels:

## Contribution Levels

### 1. Base Repository (This Repo)

**What to contribute:**
- Generic, reusable skills, commands, agents, or output styles
- Bug fixes to existing customizations
- Documentation improvements
- Infrastructure improvements (build system, CI/CD, etc.)
- Application features

**Requirements:**
- Must be generic and not organization-specific
- Must work in any environment
- Must be well-documented
- Must include examples
- Must be tested

**Examples:**
- ✅ Generic API testing skill
- ✅ Code review command for any language
- ✅ Documentation generator agent
- ❌ Deployment script for specific infrastructure
- ❌ Tool requiring proprietary APIs

### 2. Organization Fork

**What to contribute:**
- Organization-specific customizations
- Internal tools and integrations
- Company standards and conventions
- Team-specific templates

**Requirements:**
- Use organization prefix (e.g., `321-`)
- Document internal dependencies
- Follow organization guidelines
- Test in organization environment

### 3. Personal Fork

**What to contribute:**
- Personal customizations
- Experimental features
- Individual preferences

**Naming:**
- Use `.personal.md` suffix
- Or place in `personal/` directories
- These are gitignored by default

## Getting Started

### Development Setup

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/agent-helpers.git
   cd agent-helpers
   ```

3. **Set up remotes**
   ```bash
   # Add upstream (base repository)
   git remote add upstream https://github.com/AlexisLaporte/agent-helpers.git

   # If contributing from organization fork
   git remote add base https://github.com/AlexisLaporte/agent-helpers.git
   git remote add org https://github.com/YOUR_ORG/agent-helpers.git

   # Verify remotes
   git remote -v
   ```

4. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   # Visit http://localhost:3011
   ```

### Project Structure

```
agent-helpers/             # Next.js web application
├── app/                   # Next.js App Router pages
├── components/            # React components
├── lib/                   # Core libraries
├── library/               # Customizations library
│   ├── skills/           # Skills library
│   ├── commands/         # Commands library
│   ├── agents/           # Agents library
│   └── output-styles/    # Output styles library
├── scripts/               # Build and dev scripts
├── .github/              # GitHub configuration
├── package.json
└── README.md
```

## Multi-Account Management

This repository supports working with multiple GitHub and Vercel accounts without changing your global configuration. This is useful when you have both personal and organization accounts.

### Current Configuration

- **GitHub Repository**: `AlexisLaporte/agent-helpers` (personal)
- **Vercel Deployment**: Team `tulsme` (personal account `alexislaporte`)
- **Fork**: `321founded/agent-helpers` (organization fork)

### GitHub CLI (gh) Account Management

**Important**: Your global `gh` CLI might be configured for a different account (e.g., organization account) that does NOT have access to this personal repository.

Unlike git credentials, `gh` CLI manages permissions per account. If your active account doesn't have access to this repo, you have two options.

#### Check Your Access

```bash
# Check which account is active
gh auth status

# Try to access the repo
gh repo view AlexisLaporte/agent-helpers
```

If you get a permission error, your active account doesn't have access.

#### Option 1: Temporary Account Switch (Interactive Work)

Switch to the account that owns this repo:

```bash
# Switch to personal account
gh auth switch --user AlexisLaporte

# Now work normally
gh pr create
gh issue list
gh pr merge 123

# When done, switch back to your default account
gh auth switch --user YourDefaultAccount
```

**Note**: This changes the active account globally until you switch back. All terminal sessions will use the switched account.

#### Option 2: GitHub API with Personal Token (Automation/Scripts)

Use the GitHub REST API directly with a personal access token:

```bash
# Create a token at: https://github.com/settings/tokens
# Grant 'repo' scope for full repository access

# Example: Create a pull request via API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/AlexisLaporte/agent-helpers/pulls \
  -d '{
    "title": "Your PR Title",
    "head": "feature-branch",
    "base": "master",
    "body": "PR description"
  }'
```

This approach is ideal for automation scripts and CI/CD where you don't want to switch accounts.

#### Option 3: Add Collaborator Access (If You Want Unified Access)

If you prefer to use your organization account for this repo too:

1. Add your organization account as a collaborator on the personal repo
2. Accept the invitation
3. Then use `--repo` flag: `gh pr create --repo AlexisLaporte/agent-helpers`

**Only do this if you want both accounts to have access.** Skip if you prefer to keep accounts separated.

### Vercel CLI Account Management

**Important**: Unlike GitHub CLI, Vercel CLI only supports one logged-in account at a time. Since this project deploys to the personal account (`alexislaporte` on team `tulsme`) but your global Vercel might be logged into the 321 account, you have two options:

#### Option 1: Use Vercel Token (Recommended)
Create a personal Vercel token and use it for this project:

```bash
# Create token at: https://vercel.com/account/tokens
# Then use it for this project:
cd app
vercel --token=YOUR_PERSONAL_TOKEN deploy

# Or set as environment variable
export VERCEL_TOKEN=YOUR_PERSONAL_TOKEN
vercel deploy
```

**Benefits**: No need to switch accounts, works alongside 321 account.

#### Option 2: Temporarily Switch Accounts
```bash
# Logout from current account
vercel logout

# Login with personal account
vercel login alexis.laporte@gmail.com

# Link and deploy
cd app
vercel link
vercel deploy

# When done, switch back to 321 account
vercel logout
vercel login  # Use 321 email
```

**Note**: This affects all Vercel projects temporarily.

#### Option 3: Use Different Vercel Config Directory
```bash
# Use a separate config directory for this project
cd app
vercel --global-config=/path/to/personal/.vercel deploy
```

**Current Status**: The project is currently linked to the 321 team. It needs to be re-linked to the personal `tulsme` team using one of the methods above.

### Local Git Configuration

This repository uses local git configuration to ensure commits use the correct identity:

```bash
# View current local config
git config --local user.name
git config --local user.email

# Set if needed
git config --local user.name "Your Name"
git config --local user.email "your.email@example.com"
```

Local configuration overrides global configuration only for this repository.

### Repository Remotes

```bash
# View configured remotes
git remote -v

# Expected output:
# origin    https://github.com/AlexisLaporte/agent-helpers.git
# fork321   https://github.com/321founded/agent-helpers.git
```

### Auto-Sync to Organization Fork

Changes pushed to the `master` branch of this repository automatically sync to the organization fork (`321founded/agent-helpers`) via GitHub Actions (`.github/workflows/sync-to-321-fork.yml`).

**How it works:**
1. When you push to master, the workflow triggers
2. It checks out the 321 fork
3. Merges changes from personal repo (upstream)
4. Pushes merged result to 321 fork

**Setup Requirements:**
The workflow requires a GitHub secret called `FORK_SYNC_TOKEN`:
1. Create a Personal Access Token (PAT) at https://github.com/settings/tokens
2. Grant `repo` scope (full control of private repositories)
3. Add as repository secret: Settings → Secrets → Actions → New repository secret
4. Name: `FORK_SYNC_TOKEN`
5. Value: Your PAT

**Organization-Specific Files:**
The fork maintains organization-specific files through separate commits:
- `README.321.md`
- `library/skills/321-example-skill/`

These files exist in the fork's history and are preserved during merges.

## Contribution Workflow

### For Base Repository

1. **Create a feature branch**
   ```bash
   git fetch upstream
   git checkout -b feature/my-new-feature upstream/master
   ```

2. **Make your changes**
   - Add your customization in the appropriate directory
   - Follow the style guidelines (see below)
   - Add documentation
   - Test thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new API helper skill"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

5. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template completely
   - Link any related issues

### For Organization Repository

1. **Create a feature branch**
   ```bash
   git checkout -b feature/321-deployment-helper
   ```

2. **Add organization-prefixed customization**
   ```bash
   mkdir -p library/skills/321-deployment-helper
   # Add your files
   ```

3. **Follow organization guidelines**
   - Check with your team lead
   - Follow internal standards
   - Document dependencies

4. **Submit PR to organization repository**

## Style Guidelines

### Skills

Structure:
```
library/skills/
└── skill-name/
    ├── SKILL.md          # Required: Documentation with frontmatter
    ├── script-name       # Optional: Executable scripts
    └── templates/        # Optional: Template files
```

SKILL.md format:
```markdown
---
name: Skill Name
description: Brief description of what this skill does
---

# Skill Name

Detailed description of the skill.

## Usage

How to use this skill...

## Examples

Example use cases...

## Requirements

Any prerequisites or dependencies...
```

### Commands

File: `library/commands/command-name.md`

Format:
```markdown
---
description: What this command does
allowed-tools: Bash, Read, Write
argument-hint: [filename] [options]
---

Detailed instructions for Claude Code on how to execute this command.

Use $ARGUMENTS or $1, $2 for parameters.
```

### Agents

File: `library/agents/agent-name.md`

Format:
```markdown
---
name: agent-name
description: When to use this agent
tools: Read, Write, Bash
model: sonnet
---

System prompt describing the agent's role, behavior, and instructions.
```

### Output Styles

File: `library/output-styles/style-name.md`

Format:
```markdown
---
name: Style Name
description: Brief description
---

# Custom Style Instructions

Your custom instructions for Claude Code's output format and behavior.
```

### TypeScript/JavaScript Code

- Use TypeScript for type safety
- Follow Next.js conventions
- Use async/await for asynchronous operations
- Add JSDoc comments for functions
- Use meaningful variable names

## Commit Messages

Follow the Conventional Commits specification:

Format: `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(skills): add API testing helper skill
fix(commands): correct argument parsing in deploy command
docs(readme): update contribution guidelines
refactor(lib): simplify customization-manager logic
```

**Body (optional but recommended):**
```
feat: add API testing helper skill

This skill provides utilities for testing REST APIs:
- Request formatting and validation
- Response parsing and assertion
- Error handling and reporting

Includes examples for common use cases.
```

## Pull Request Process

1. **Ensure your PR:**
   - Has a clear title and description
   - Follows the PR template
   - Includes tests if applicable
   - Updates documentation
   - Has no merge conflicts

2. **PR Review:**
   - Maintainers will review your PR
   - Address feedback promptly
   - Make requested changes in new commits
   - Don't force-push unless requested

3. **After Approval:**
   - Maintainer will merge your PR
   - Your contribution will be credited
   - For organizations: sync your fork with upstream

4. **Post-Merge:**
   ```bash
   # Update your fork
   git fetch upstream
   git checkout master
   git merge upstream/master
   git push origin master
   ```

## Testing Guidelines

### Testing Customizations

1. **Test in clean environment**
   ```bash
   # Create a test directory
   mkdir -p ~/.claude/test-skills
   cp -r skills/your-skill ~/.claude/test-skills/

   # Test with Claude Code
   # Verify it works as expected
   ```

2. **Test edge cases**
   - Missing files
   - Invalid inputs
   - Different environments

3. **Document test results in PR**

### Testing Application Changes

1. **Run locally**
   ```bash
   cd app
   npm run dev
   # Test functionality in browser
   ```

2. **Check for errors**
   ```bash
   npm run build
   # Ensure build succeeds
   ```

3. **Test with real data**
   - Use actual customizations
   - Test all CRUD operations
   - Verify UI/UX

## Questions?

- **General questions**: Open a [Discussion](https://github.com/AlexisLaporte/agent-helpers/discussions)
- **Bug reports**: Open an [Issue](https://github.com/AlexisLaporte/agent-helpers/issues)
- **Organization-specific**: Contact your team lead

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README acknowledgments (optional)

Thank you for contributing to Agent Helpers! 🎉
