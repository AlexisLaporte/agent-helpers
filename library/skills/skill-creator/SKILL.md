---
name: Skill Creator
description: Guide for creating custom Claude Code skills. Use when user wants to create a new skill, understand skill structure, or extend Claude's capabilities with custom tools.
source: base
---

# Skill Creator

Create custom skills to extend Claude Code's capabilities.

## When to Use

Use this skill when the user wants to:
- Create a new custom skill
- Understand skill file structure
- Add domain-specific knowledge
- Build reusable tools or workflows
- Package common tasks into skills
- Share skills with their team

## Skill Structure

A skill is a directory containing:

```
my-skill/
├── SKILL.md          # Required: skill documentation and instructions
└── [optional files]  # Scripts, configs, templates, etc.
```

## SKILL.md Format

```markdown
---
name: Skill Name
description: Brief description. When Claude should use this skill.
source: base|personal|team
---

# Skill Name

Detailed description of what this skill does.

## When to Use

Specific triggers that should activate this skill:
- User says X
- User wants to do Y
- User asks about Z

## [Additional sections as needed]

Usage examples, API references, commands, etc.
```

## Frontmatter Fields

```yaml
name: Display name for the skill
description: Short description (1-2 sentences) including WHEN to use it
source: base (built-in) | personal (private) | team (shared)
```

## Location

Skills should be placed in:
- `~/.claude/skills/` - Your personal skills
- Project `.claude/skills/` - Project-specific skills
- `library/skills/` - Bundled skills (for maintainers)

## Skill Best Practices

### 1. Clear Triggers

Be explicit about when Claude should use the skill:

```markdown
## When to Use

Use this skill when the user:
- Mentions "kubernetes" or "k8s"
- Wants to deploy to production
- Asks about cluster status
```

### 2. Actionable Instructions

Provide concrete commands and examples:

```markdown
## Commands

Deploy to staging:
```bash
kubectl apply -f deploy/staging/
```

Check pod status:
```bash
kubectl get pods -n production
```
```

### 3. Include Context

Add domain knowledge Claude needs:

```markdown
## Our Infrastructure

- Staging: us-east-1 cluster
- Production: multi-region (us-east-1, eu-west-1)
- Database: RDS PostgreSQL 14
- CI/CD: GitHub Actions → ArgoCD
```

### 4. Error Handling

Document common issues and solutions:

```markdown
## Common Issues

**Pod won't start**: Check image pull secrets
```bash
kubectl describe pod <name> -n <namespace>
```

**Database connection fails**: Verify RDS security groups
```

## Examples

### Simple Documentation Skill

```markdown
---
name: API Documentation
description: Company API documentation. Use when user asks about API endpoints, authentication, or integration.
source: team
---

# Company API

## Authentication

All requests require Bearer token:
```bash
curl -H "Authorization: Bearer $TOKEN" https://api.company.com/v1/users
```

## Endpoints

- GET /v1/users - List users
- POST /v1/users - Create user
- GET /v1/users/:id - Get user details
```

### Skill with Scripts

```markdown
---
name: Database Backup
description: PostgreSQL backup procedures. Use when user wants to backup or restore database.
source: team
---

# Database Backup

## Create Backup

Run the backup script:
```bash
~/.claude/skills/db-backup/backup.sh production
```

This creates: `backups/db-YYYY-MM-DD.sql.gz`

## Restore

```bash
~/.claude/skills/db-backup/restore.sh backups/db-2024-01-15.sql.gz
```
```

With accompanying `backup.sh`:
```bash
#!/bin/bash
ENV=$1
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > backups/db-$(date +%Y-%m-%d).sql.gz
```

### Workflow Skill

```markdown
---
name: Release Process
description: Production release workflow. Use when user wants to create a release or deploy to production.
source: team
---

# Release Process

## Steps

1. **Create release branch**
```bash
git checkout -b release/v1.2.3
```

2. **Update version**
```bash
npm version 1.2.3
```

3. **Run full test suite**
```bash
npm run test:all
```

4. **Create PR to main**
- Require 2 approvals
- All checks must pass
- Squash and merge

5. **Deploy via GitHub Actions**
Tag will trigger automatic deployment to production.

## Rollback

```bash
kubectl rollout undo deployment/app -n production
```
```

## Testing Your Skill

1. Create skill in `~/.claude/skills/my-skill/`
2. Invoke Claude Code: `claude`
3. Trigger your skill by asking relevant questions
4. Check that Claude uses the skill instructions
5. Iterate on the documentation

## Tips

- **Be specific**: Vague instructions lead to inconsistent behavior
- **Use examples**: Show actual commands and outputs
- **Update regularly**: Keep skills current with your stack
- **One purpose per skill**: Better than large multi-purpose skills
- **Test thoroughly**: Try various phrasings to trigger the skill
- **Include links**: Reference external docs when helpful
- **Use markdown**: Code blocks, lists, headers for clarity

## Skill Ideas

- Team coding standards and linting rules
- Deployment procedures for different environments
- API documentation and integration guides
- Database schema and migration procedures
- Testing frameworks and coverage requirements
- Security policies and compliance checks
- Monitoring and alerting setup
- Incident response procedures
- Onboarding checklists for new team members
- Common troubleshooting guides

## Resources

- Claude Code docs: https://docs.claude.com/claude-code
- Skills directory: ~/.claude/skills/
- Example skills: library/skills/ in agent-helpers
