# Claude Code Manager

Desktop app + skills library for [Claude Code](https://claude.ai/code).

## Skills Library

Ready-to-use skills for Claude Code. Browse them at [claude.tuls.me/skills](https://claude.tuls.me/skills).

| Skill | Description |
|-------|-------------|
| [session:search](skills/session-search/) | Search and find previous Claude Code conversations |
| [session:copy](skills/session-copy/) | Copy sessions between project folders |
| [up:context](skills/up-context/) | Update project documentation (CLAUDE.md + docs/) |
| [up:research](skills/up-research/) | Log research work and experiments to progress.yaml |
| [up:task](skills/up-task/) | Analyze conversation and update todo.json |
| [have-image](skills/have-image/) | Search and generate images (Unsplash, Pollinations, Google) |
| [git-commit](skills/git-commit/) | Git commit with domain-based conventions |
| [devops-setup](skills/devops-setup/) | Setup dev servers, CI/CD, deployment |

### Install a skill

Copy a skill folder to `~/.claude/skills/`:

```bash
# Example: install session:search
curl -sL https://claude.tuls.me/skills/session:search/raw > ~/.claude/skills/session-search/SKILL.md
```

Or paste this in Claude Code:

```
Download https://claude.tuls.me/skills/session:search/raw and save it as ~/.claude/skills/session-search/SKILL.md
```

## Desktop App

### Features

- **Project browser** - Switch between global (`~/.claude/`) and project-specific configurations
- **3-zone file tree** - CLAUDE.md, configuration files (skills, commands, settings), system files
- **Ghost files** - Missing recommended files shown grayed out with templates
- **Monaco editor** - Syntax highlighting, tabs, auto-save detection
- **File watching** - Real-time updates when files change externally
- **Auto-update** - Automatic update notifications when new versions are available

### Quick install (Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/AlexisLaporte/claude-code-manager/master/scripts/install.sh | bash
```

### Manual install

Download from [Releases](https://github.com/AlexisLaporte/claude-code-manager/releases):

```bash
# .deb (Debian/Ubuntu)
sudo dpkg -i claude-code-manager_*.deb

# .AppImage
chmod +x Claude_Code_Manager_*.AppImage
./Claude_Code_Manager_*.AppImage
```

## Development

```bash
npm install
npm run dev
npm run build
```

## Release

```bash
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

## License

MIT
