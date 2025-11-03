# Commands

Custom slash commands for Claude Code.

## Structure

Each command is a single `.md` file with optional frontmatter:

```markdown
---
description: What this command does
allowed-tools: Tool1, Tool2
argument-hint: [parameter]
model: claude-3-5-haiku-20241022
---

Command instructions here. Use $ARGUMENTS or $1, $2 for parameters.
```

## Usage

Install commands to `~/.claude/commands/` (user-level) or `.claude/commands/` (project-level).

File name becomes command name (e.g., `optimize.md` → `/optimize`).
