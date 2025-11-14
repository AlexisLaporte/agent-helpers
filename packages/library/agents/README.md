# Agents

Specialized subagents for Claude Code with custom system prompts and tool access.

## Structure

Each agent is a single `.md` file with frontmatter:

```markdown
---
name: agent-name
description: When to use this agent
tools: Tool1, Tool2, Tool3
model: sonnet
---

System prompt describing the agent's role and behavior.
```

## Usage

Install agents to `~/.claude/agents/` (user-level) or `.claude/agents/` (project-level).

Agents operate with their own context window separate from main conversation.
