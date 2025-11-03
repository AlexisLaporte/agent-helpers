---
name: Vercel Init
description: Initialize a new Node.js project with Git, GitHub, Vercel, and auto-deploy webhooks. Use when starting a new project that needs Vercel deployment with automatic GitHub integration.
source: base
---

# Vercel Init

This skill automates the complete setup of a new project with Git, GitHub, Vercel deployment, and auto-deploy webhooks.

## When to Use

Use this skill when:
- Starting a new Node.js project that needs to be deployed to Vercel
- You want automatic deployments triggered by git pushes
- Team members need to deploy without Vercel permissions (webhook bypasses permission checks)
- Setting up a project for the first time

**Note**: This is a one-time setup per project. For subsequent deployments, use the `vercel-deployment` skill.

## What It Does

This skill performs the complete initialization workflow:

1. **Git Initialization**
   - Initializes git repository
   - Creates initial commit
   - Renames branch to `main`

2. **GitHub Repository Creation**
   - Creates GitHub repository (public or private)
   - Pushes code to GitHub
   - Sets up remote connection

3. **Vercel Deployment**
   - Links project to Vercel
   - Creates `.vercel/project.json`
   - Performs first production deployment

4. **Auto-Deploy Webhook Setup**
   - Creates Vercel Deploy Hook
   - Configures GitHub webhook
   - Enables automatic deployments on push to main

## Prerequisites

Before using this skill, ensure:
- ✅ You are authenticated with Vercel: `vercel login`
- ✅ You are authenticated with GitHub CLI: `gh auth login`
- ✅ You have a Node.js project ready (with `package.json`)
- ✅ You are in the project directory

## Usage

Simply tell Claude to initialize Vercel deployment:

```
Initialize this project for Vercel deployment
```

or

```
Set up GitHub and Vercel for this project
```

Claude will:
1. Check prerequisites
2. Ask for project configuration (name, visibility)
3. Execute the full initialization workflow
4. Test the auto-deploy setup
5. Provide the deployment URL

## Configuration Options

The skill will prompt for:
- **Project name**: GitHub repository name
- **Visibility**: Public or private repository
- **Vercel team/account**: Which Vercel account to use

## What You'll Get

After successful initialization:

- ✅ Git repository initialized
- ✅ Code pushed to GitHub
- ✅ Project deployed to Vercel
- ✅ Production URL active
- ✅ Auto-deploy webhook configured
- ✅ `.vercel/project.json` created (gitignored)

## Daily Workflow After Setup

Once initialized, deploy new changes with simple git workflow:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Auto-deployment triggers automatically. No Vercel permissions needed.

## Workflow Details

### Step 1: Git & GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"
git branch -m main

# Create GitHub repo and push
gh repo create PROJECT_NAME --public --source=. --remote=origin --push
```

### Step 2: Deploy to Vercel

```bash
# First deployment (creates project)
vercel --yes

# This creates:
# - .vercel/project.json (project configuration)
# - Production deployment
# - Deployment URL
```

### Step 3: Setup Auto-Deploy Webhook

```bash
# Extract project configuration
PROJECT_ID=$(cat .vercel/project.json | jq -r '.projectId')
TOKEN=$(cat ~/.local/share/com.vercel.cli/auth.json | jq -r '.token')

# Create Vercel Deploy Hook
curl -X POST "https://api.vercel.com/v1/projects/${PROJECT_ID}/deploy-hooks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "main-branch-hook", "ref": "main"}'

# Configure GitHub webhook to call Deploy Hook on push
gh api -X POST /repos/OWNER/REPO/hooks --input webhook.json
```

### Step 4: Verify Setup

```bash
# Test auto-deploy
git commit --allow-empty -m "Test auto-deploy"
git push origin main

# Check webhook delivery (expect 201 status)
# Check deployment status (expect READY)
```

## Verification

The skill automatically verifies:

1. **Webhook delivery**: Confirms GitHub successfully called Vercel hook (HTTP 201)
2. **Deployment status**: Checks Vercel deployment started/completed
3. **Production URL**: Provides the live deployment URL

## Troubleshooting

### Authentication Issues

**`vercel` command fails**:
```bash
vercel login
```
Re-authenticate and try again.

**`gh` command fails**:
```bash
gh auth login
```
Authenticate with GitHub and try again.

### Webhook Issues

**Webhook returns 404**:
- Deploy hook was deleted
- Re-run webhook creation (Step 3)

**Webhook returns 401/403**:
- Vercel token expired
- Run `vercel login` to refresh

**No deployment triggered**:
```bash
# Check webhook exists and is active
gh api /repos/OWNER/REPO/hooks | jq '.[] | {id, active, config: {url: .config.url}}'
```

### Deployment Fails

Check Vercel dashboard for build logs:
```
https://vercel.com/TEAM/PROJECT_NAME/deployments
```

## How Auto-Deploy Works

1. Developer pushes to `main` branch
2. GitHub webhook calls Vercel Deploy Hook URL
3. Vercel triggers new deployment (no GitHub permissions checked)
4. Build completes and goes live at production URL

**Why webhooks?** Team members without Vercel permissions can't trigger auto-deploys through native integration. Deploy Hooks bypass permission checks.

## Files Created

- `.vercel/project.json` - Vercel project configuration (gitignored)
- `deploy_hook.json` - Temporary file with hook URL (can be deleted)
- `webhook.json` - Temporary file with webhook config (can be deleted)

## Notes

- This is a **one-time setup** per project
- After setup, use normal git workflow (`git push`) to deploy
- Deploys are automatic on push to `main` branch
- Other branches can be deployed manually with `vercel`
- The skill creates webhooks for the `main` branch only

## References

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Deploy Hooks API](https://vercel.com/docs/rest-api/endpoints/deployments)
- [GitHub Webhooks API](https://docs.github.com/en/rest/webhooks)
