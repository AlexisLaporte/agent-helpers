---
name: Conversation Finder
description: Find and resume previous Claude Code conversations by keyword, location, or date. Use when the user wants to find old conversations, resume previous work, search chat history, or asks "what did we discuss about X". Can automatically open conversations in new terminals.
source: base
---

# Conversation Finder

This skill helps find and resume previous Claude Code conversations.

## When to Use

Use this skill when the user:
- Wants to find conversations about a specific topic (e.g., "find the conversation about bluetooth")
- Asks to resume previous work or discussions
- Wants to see conversations from a specific directory
- Searches for old chat history
- Says something like "what did we talk about X" or "find that conversation where we..."

## Usage

The skill uses the `claude-find` command with various options:

### Basic Search (Display Only)
```bash
claude-find <keyword>
```
Searches all conversations containing the keyword and displays the 30 most recent matches.

**Note**: This only displays results. The shown `claude --resume` command may not work in new terminals due to PATH issues.

### Filter by Current Directory
```bash
claude-find --here
claude-find <keyword> --here
```
Shows only conversations from the current working directory.

### ⭐ Interactive Selection (Recommended)
```bash
claude-find <keyword> --open
```
Displays matching conversations and lets the user select which one to **automatically open in a new terminal**.

The script handles the correct claude command path, so the conversation will open properly.

### ⭐ Auto-Open Most Recent (Recommended)
```bash
claude-find <keyword> --auto
```
Automatically opens the most recent matching conversation in a new terminal.

The script handles the correct claude command path, so the conversation will open properly.

## What It Shows

For each conversation, you'll see:
- Date and time of last activity
- Project/directory path
- Summary (if available)
- First and last messages (truncated)
- Number of messages
- `[compacted]` marker if the conversation was compressed
- Command to resume: `claude --resume <session-id>`

## Examples

```bash
# Just search and display results (doesn't open)
claude-find bluetooth

# ⭐ Find and auto-open the most recent conversation (RECOMMENDED)
claude-find manutan --auto

# ⭐ Search and interactively select which one to open (RECOMMENDED)
claude-find statusline --open

# Show all conversations in current directory
claude-find --here

# Combine filters: search for keyword in current directory and auto-open
claude-find workspace --here --auto
```

## Technical Details

- Script location: `~/.claude/skills/conversation-finder/claude-find`
- Searches: `~/.claude/projects/` for session files
- Sorting: By last activity timestamp (handles compacted sessions)
- Terminal: Opens using `xdg-terminal-exec` (your default terminal)
- Permissions: Uses `--dangerously-skip-permissions` to skip trust prompts

## Important: How to Open Conversations

When you find a conversation, there are two ways to open it:

### ❌ Manual (Not Recommended)
Copying the `claude --resume <session-id>` command from search results may fail in new terminals due to PATH configuration.

### ✅ Automatic (Recommended)
Use `--open` or `--auto` flags:
- The script automatically uses the full path to the claude command
- Opens the conversation in the correct working directory
- Skips permission prompts with `--dangerously-skip-permissions`

**Example**: Instead of running `claude --resume 173e38ee...`, use:
```bash
claude-find touchpad --auto
```

## Notes

- Results are limited to 30 most recent conversations
- Keyword search is case-insensitive
- Search looks through entire conversation content, not just summaries
- Conversations are sorted by last activity, so compacted/resumed conversations appear with their latest timestamp
- The script uses `/home/alexis/data/node/.npm-global/bin/claude` as the full path to ensure commands work in new terminals
