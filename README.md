# Claude Code Manager

Desktop app to manage [Claude Code](https://claude.ai/code) configurations.

## Features

- **Project browser** - Switch between global (`~/.claude/`) and project-specific configurations
- **3-zone file tree** - CLAUDE.md, configuration files (skills, commands, settings), system files
- **Ghost files** - Missing recommended files shown grayed out with templates
- **Monaco editor** - Syntax highlighting, tabs, auto-save detection
- **File watching** - Real-time updates when files change externally

## Installation

### Linux (.deb)

Download from [Releases](https://github.com/AlexisLaporte/claude-code-manager/releases):

```bash
sudo dpkg -i claude-code-manager_*.deb
```

### Linux (.AppImage)

```bash
chmod +x Claude_Code_Manager_*.AppImage
./Claude_Code_Manager_*.AppImage
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build release
npm run build
```

## Release

Push a tag to trigger GitHub Actions:

```bash
git tag desktop-v0.1.0
git push origin desktop-v0.1.0
```

## License

MIT
