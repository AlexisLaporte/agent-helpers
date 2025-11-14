# Output Styles

Custom output styles that modify Claude Code's system prompt and behavior.

## Structure

Each style is a single `.md` file with frontmatter:

```markdown
---
name: Style Name
description: Brief description
---

# Custom Style Instructions

Your custom instructions here...

## Specific Behaviors

Define how the assistant should behave...
```

## Usage

Install styles to `~/.claude/output-styles/` (user-level) or `.claude/output-styles/` (project-level).

Activate with `/output-style [name]` command.
