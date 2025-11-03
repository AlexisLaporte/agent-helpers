# Agent Helpers

## What is Agent Helpers?

**Desktop app for managing Claude Code customizations**

Agent Helpers is an Electron application that provides a visual interface for managing your local `~/.claude/` directory:
- 📂 Browse and edit skills, commands, agents, output-styles
- 📝 Edit CLAUDE.md, settings, hooks
- 🔄 Project switcher for multi-project workflows
- 📦 Bundled starter templates

**Distribution**: `.deb` (Linux) and `.dmg` (macOS) packages via [GitHub Releases](https://github.com/AlexisLaporte/agent-helpers/releases)

### Template Library

The app includes curated starter templates:
- `library/` - Public templates (bundled in the app)
- `library-personal/` - Your private templates (gitignored)

## Fonctionnalités

- 📂 **Browse & Manage**: Skills, Commands, Agents, Output Styles
- 📝 **Edit**: CLAUDE.md, settings, hooks, statusline
- 🔍 **Compare**: Versions locales vs library
- 🗑️ **Archive/Delete**: Gestion complète du cycle de vie
- ⚙️ **Configure**: Paths et settings via UI

## Installation

**📦 Guide complet: [INSTALL.md](INSTALL.md)**

### Quick Install

```bash
# Download latest from GitHub Releases
curl -fsSL https://raw.githubusercontent.com/AlexisLaporte/agent-helpers/main/scripts/install-latest.sh | bash
```

### Build from source

```bash
# Build
npm run build:linux

# Install
sudo dpkg -i dist/agent-helpers_0.1.0_amd64.deb

# Launch
agent-helpers
```

### Dev mode

```bash
npm install
npm run dev  # http://localhost:3011
```

## Structure

```
~/.claude/                 # Configuration Claude Code
├── CLAUDE.md             # Instructions globales (NEW!)
├── settings.json         # Settings projet
├── settings.local.json   # Settings machine
├── statusline.sh         # Custom statusline
├── skills/               # Vos skills
├── commands/             # Vos slash commands
├── agents/               # Vos agents
├── output-styles/        # Vos styles output
└── hooks/                # Vos hooks
```

## Customizations supportées

1. **Skills** - Capacités modulaires
2. **Commands** - Slash commands custom
3. **Agents** - Subagents spécialisés
4. **Output Styles** - Formatting custom
5. **CLAUDE.md** - Instructions globales
6. **Hooks** - Event handlers
7. **Settings** - Configuration JSON

## Architecture Tech

- **Framework**: Next.js 15 (standalone)
- **Desktop**: Electron
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package**: electron-builder (.deb)

## Build & Deploy

```bash
# Build Next.js standalone
npm run build:next

# Build Linux (.deb)
npm run build:linux

# Build macOS (.dmg) - requires macOS
npm run build:mac

# Build both platforms
npm run build:all
```

**Output:**
- Linux: `dist/agent-helpers_0.1.0_amd64.deb`
- macOS: `dist/agent-helpers-0.1.0.dmg`

## User Workflow

1. **Install**: Download `.deb`/`.dmg` from [GitHub Releases](https://github.com/AlexisLaporte/agent-helpers/releases)
2. **Launch**: Open the desktop app
3. **Manage**: Browse and edit your `~/.claude/` customizations
4. **Templates**: Install bundled templates or create your own

## Releases (for maintainers)

### Create a release

```bash
# Linux only
./scripts/release.sh 0.2.0

# macOS only (requires macOS)
./scripts/release.sh 0.2.0 mac

# Both platforms
./scripts/release.sh 0.2.0 all
```

The script:
1. Updates `package.json` version
2. Commits + tags `v0.2.0`
3. Builds packages
4. Pushes to remote

Then:
1. Go to [GitHub Releases](https://github.com/AlexisLaporte/agent-helpers/releases/new)
2. Create release for tag `v0.2.0`
3. Upload packages:
   - `agent-helpers_0.2.0_amd64.deb` (Linux)
   - `agent-helpers-0.2.0.dmg` (macOS)
4. Announce the release

### Users: Install/update

**Linux:**
```bash
wget https://github.com/AlexisLaporte/agent-helpers/releases/download/v0.2.0/agent-helpers_0.2.0_amd64.deb
sudo dpkg -i agent-helpers_0.2.0_amd64.deb
```

**macOS:**
```bash
curl -L -O https://github.com/AlexisLaporte/agent-helpers/releases/download/v0.2.0/agent-helpers-0.2.0.dmg
open agent-helpers-0.2.0.dmg
# Drag to Applications
```

## Configuration

Config file: `~/.config/agent-helpers/config.json`

```json
{
  "localSkillsPath": "/home/user/.claude/skills",
  "localCommandsPath": "/home/user/.claude/commands",
  "localAgentsPath": "/home/user/.claude/agents",
  "localOutputStylesPath": "/home/user/.claude/output-styles",
  "gitRepoUrl": "https://github.com/you/agent-helpers",
  "archivedSkills": [],
  "archivedCommands": [],
  "archivedAgents": [],
  "archivedOutputStyles": [],
  "autoSync": false,
  "theme": "dark"
}
```

Configure via Settings page in the app.

## Roadmap

- [ ] Création de customizations depuis templates
- [ ] Éditeur markdown avancé
- [ ] Git sync intégré
- [ ] Search/filter dans les customizations
- [ ] Export/import configurations
- [ ] MCP server pour remote management

## Développement

### Structure du projet

```
agent-helpers/
├── app/                  # Next.js App Router
│   ├── browse/          # Page principale (manage local)
│   ├── claude-md/       # Éditeur CLAUDE.md
│   ├── file/           # Éditeur générique
│   ├── projects/       # Sélecteur projets
│   └── api/            # API routes
├── components/          # React components
├── lib/                # Core libraries
│   ├── customization-manager.ts  # CRUD operations
│   ├── config.ts       # Config management
│   └── environment.ts  # Env detection (local only)
├── electron/           # Electron main process
│   └── main.js         # Entry point + serveur Next.js
├── library/            # Customizations templates
└── public/             # Static assets
```

### Scripts

```bash
npm run dev          # Dev mode (Next.js dev server)
npm start            # Prod mode (Next.js standalone)
npm run build:next   # Build Next.js standalone
npm run build:linux  # Build + package .deb
npm run electron     # Lance Electron en dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Focus areas:
- New starter templates for `library/`
- Desktop app UX/UI improvements
- Documentation improvements
- Bug fixes and performance enhancements

## License

MIT
