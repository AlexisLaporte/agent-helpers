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
   npm install
   ```

5. **Start development server**
   ```bash
   # Desktop app (Electron)
   npm run dev
   # Visit http://localhost:3011

   # Or launch Electron
   npm run electron
   ```

### Project Structure

```
agent-helpers/
├── app/                   # Next.js App Router pages
├── components/            # React components
├── lib/                   # Core libraries
├── electron/              # Electron main process
├── library/               # Public starter templates
│   ├── skills/           # Starter skills
│   ├── commands/         # Starter commands
│   ├── agents/           # Starter agents
│   └── output-styles/    # Starter output styles
├── library-personal/      # Your private templates (gitignored)
├── scripts/               # Build and release scripts
├── .github/              # GitHub workflows
├── package.json
└── README.md
```

## Branch Strategy

This project uses a dual architecture:

- **`master` branch**: Desktop Electron app (current focus)
- **`web` branch**: Web library for browsing templates (coming soon)

When contributing, specify which branch your PR targets:

```bash
# For desktop app features
git checkout -b feature/my-desktop-feature master
# Submit PR to master branch

# For web library features
git checkout -b feature/my-web-feature web
# Submit PR to web branch
```

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
   npm run dev
   # Test functionality in browser at http://localhost:3011
   ```

2. **Check for errors**
   ```bash
   npm run build:next
   # Ensure Next.js build succeeds

   npm run build:linux
   # Test .deb package creation (Linux only)
   ```

3. **Test with real data**
   - Use actual customizations in ~/.claude/
   - Test all CRUD operations
   - Verify UI/UX
   - Test in Electron app: `npm run electron`

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
