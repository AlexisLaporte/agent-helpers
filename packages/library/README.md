# Agent Helpers - Template Library

This directory contains **curated starter templates** for Claude Code customizations.

## Purpose

The `library/` directory serves as:
- Bundled examples shipped with the Agent Helpers desktop app
- Starter templates for new users to explore Claude Code capabilities
- High-quality, generic, reusable customizations

## Contents

### Skills (12 total)

**Productivity:**
- **conversation-finder** - Find and resume previous Claude Code conversations
- **skill-creator** - Guide for creating custom skills
- **file-organizer** - Organize files by type, date, or project
- **article-extractor** - Extract clean text from web articles

**Development:**
- **playwright** - Browser automation and E2E testing
- **git-worktrees** - Manage multiple Git working trees

**Documents:**
- **pdf** - PDF manipulation toolkit (extract, merge, split, create)

**Integration:**
- **notion** - Notion workspace integration
- **google-drive** - Google Sheets and Slides integration
- **figma** - Figma design file access and asset export
- **slack** - Slack messaging and bot automation
- **youtube-transcript** - Extract video transcripts

### Coming Soon

- **commands/** - Custom slash commands
- **agents/** - Specialized subagents
- **output-styles/** - Custom formatting

## Guidelines

Templates in this library should be:
- **Generic**: Useful to anyone, not organization-specific
- **Well-documented**: Clear SKILL.md/COMMAND.md with usage examples
- **Tested**: Actually working and useful
- **Maintained**: Updated when Claude Code APIs change

## Personal Templates

For your own templates, use `library-personal/` (gitignored).

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to propose new templates.
