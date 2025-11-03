---
name: Vercel Deployment
description: Deploy Node.js projects to Vercel with GitHub auto-deploy setup. Use when user wants to deploy to Vercel, set up GitHub webhooks, or configure auto-deployment from git push.
source: base
---

# Vercel Deployment

This skill helps deploy projects to Vercel, either manually or by setting up automatic deployments.

## When to Use

Use this skill when:
- Deploying an existing project to Vercel
- Setting up or updating deployment configuration
- Troubleshooting deployment issues
- Managing deployment environments (production, preview, development)

**Note**: For first-time project setup with Git, GitHub, and webhooks, use the `vercel-init` skill instead.

## What It Does

This skill can:

1. **Manual Deployment**
   - Deploy current code to Vercel
   - Deploy to production or preview environments
   - Deploy specific branches

2. **Environment Management**
   - Configure environment variables
   - Manage deployment settings
   - Switch between teams/accounts

3. **Deployment Verification**
   - Check deployment status
   - View deployment logs
   - Verify production URLs

## Prerequisites

- ✅ Authenticated with Vercel: `vercel login`
- ✅ Node.js project with `package.json`
- ✅ (Optional) Project already linked to Vercel

## Usage Examples

### Quick Deploy

```
Deploy this to Vercel
```

### Production Deployment

```
Deploy to production
```

### Check Deployment Status

```
Check the Vercel deployment status
```

### Environment Variables

```
Set up environment variables for Vercel
```

## Deployment Commands

### First Deployment (New Project)

```bash
vercel
```
This will:
- Link the project to Vercel (interactive)
- Create `.vercel/` directory
- Deploy to preview environment

### Production Deployment

```bash
vercel --prod
```
Deploys to production environment.

### Auto-Deploy (No Prompts)

```bash
vercel --yes
```
Accepts all defaults and deploys immediately.

### Specific Environment

```bash
# Development
vercel --target development

# Preview
vercel --target preview

# Production
vercel --target production --prod
```

## Environment Variables

### Pull from Vercel

```bash
vercel env pull .env.local
```
Downloads environment variables to local `.env.local` file.

### Add Variable

```bash
vercel env add SECRET_KEY
```
Interactively adds a new environment variable.

### List Variables

```bash
vercel env ls
```
Lists all environment variables for the project.

## Project Management

### Link Existing Project

```bash
vercel link
```
Links current directory to existing Vercel project.

### Project Info

```bash
vercel inspect
```
Shows deployment details and URLs.

### List Deployments

```bash
vercel ls
```
Lists recent deployments.

## Multi-Account Support

If you work with multiple Vercel accounts (personal + organization):

### Using Vercel Token

```bash
# Use a specific account token
vercel --token=YOUR_VERCEL_TOKEN deploy
```

**Setup**:
1. Create token at: https://vercel.com/account/tokens
2. Store in `.env.local`:
   ```bash
   VERCEL_TOKEN=your_token_here
   ```
3. Use in commands:
   ```bash
   source .env.local
   vercel --token="$VERCEL_TOKEN" deploy
   ```

### Switch Accounts

```bash
# Logout from current account
vercel logout

# Login with different account
vercel login your.email@example.com
```

## Deployment Workflow

### Standard Workflow (Auto-Deploy Configured)

If you've set up auto-deploy with `vercel-init`:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Deployment happens automatically via webhook.

### Manual Workflow

```bash
# Make changes
git add .
git commit -m "Your changes"

# Deploy manually
vercel --prod
```

## Troubleshooting

### Authentication Failed

```bash
vercel login
```
Re-authenticate with Vercel.

### Build Failures

```bash
# Check build logs
vercel logs [deployment-url]

# Test build locally
npm run build
```

### Environment Variable Issues

```bash
# Pull latest variables
vercel env pull .env.local

# Verify variables exist
vercel env ls
```

### Wrong Project/Team

```bash
# Unlink current project
rm -rf .vercel

# Link to correct project
vercel link
```

### Deployment Stuck

```bash
# Check deployment status
vercel inspect [deployment-url]

# Cancel and redeploy
vercel --prod --force
```

## Project Structure

Vercel configuration files:

```
project/
├── .vercel/
│   ├── project.json      # Project ID and org ID
│   └── README.txt        # Vercel info
├── vercel.json           # (Optional) Vercel configuration
├── .env.local            # (Optional) Local environment variables
└── package.json          # Required
```

## Configuration File (vercel.json)

Optional configuration for advanced setups:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "MY_VAR": "value"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

## Deployment URLs

Vercel provides three types of URLs:

1. **Production**: `your-project.vercel.app`
   - Main production deployment
   - Deployed from main/master branch (if auto-deploy)
   - Or via `vercel --prod`

2. **Preview**: `your-project-git-branch.vercel.app`
   - Automatic for pull requests
   - Each branch gets unique URL

3. **Development**: Local development
   - `vercel dev` runs local dev server
   - Simulates Vercel environment locally

## Advanced Features

### Custom Domains

```bash
# Add custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com
```

### Aliases

```bash
# Create alias
vercel alias set deployment-url.vercel.app youralias.vercel.app
```

### Teams

```bash
# List teams
vercel teams ls

# Switch team
vercel switch
```

## Monitoring

### View Logs

```bash
# Live logs
vercel logs --follow

# Specific deployment
vercel logs [deployment-url]
```

### Check Status

```bash
# Get deployment info
vercel inspect [deployment-url]

# List all deployments
vercel ls
```

## Best Practices

1. **Use Auto-Deploy**: Set up webhooks with `vercel-init` for automatic deployments
2. **Environment Variables**: Never commit secrets; use Vercel env management
3. **Test Locally**: Run `npm run build` before deploying
4. **Preview Deployments**: Use pull requests for preview URLs
5. **Monitor Deployments**: Check logs after deployment
6. **Version Control**: Always commit before deploying

## Common Workflows

### New Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
npm run dev

# Deploy preview
git push origin feature/new-feature
# Vercel automatically creates preview deployment

# After review, merge to main
git checkout main
git merge feature/new-feature
git push origin main
# Auto-deploys to production (if webhooks configured)
```

### Hotfix Production Issue

```bash
# Quick fix
git checkout main
# Make fix
git add .
git commit -m "hotfix: critical bug"

# Deploy immediately
vercel --prod
```

### Update Environment Variables

```bash
# Add new variable
vercel env add API_KEY

# Pull to local
vercel env pull .env.local

# Redeploy to apply
vercel --prod
```

## Integration with GitHub

If auto-deploy is configured via `vercel-init`:

- ✅ Push to `main` → Production deployment
- ✅ Pull request → Preview deployment with unique URL
- ✅ Comment on PR → Deployment status and URL
- ✅ Webhook ensures team members can deploy without Vercel access

## Notes

- `.vercel/` directory is gitignored by default
- Environment variables are encrypted by Vercel
- Deployments are immutable (each gets unique URL)
- Rollback is instant (just promote previous deployment)
- Free tier includes unlimited preview deployments

## References

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Configuration](https://vercel.com/docs/configuration)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)
