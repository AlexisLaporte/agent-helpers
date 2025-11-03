# Agent Helpers

Application desktop Electron pour gérer vos customizations Claude Code locales.

## Fonctionnalités

- 📂 **Browse & Manage**: Skills, Commands, Agents, Output Styles
- 📝 **Edit**: CLAUDE.md, settings, hooks, statusline
- 🔍 **Compare**: Versions locales vs library
- 🗑️ **Archive/Delete**: Gestion complète du cycle de vie
- ⚙️ **Configure**: Paths et settings via UI

## Installation

**📦 Guide complet: [INSTALL.md](INSTALL.md)**

### Installation rapide (équipe)

```bash
# Installer dernière version depuis GitHub Releases
curl -fsSL https://raw.githubusercontent.com/YOUR-ORG/agent-helpers/main/scripts/install-latest.sh | bash
```

### Build depuis sources

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

## Releases (pour mainteneurs)

### Créer une release

```bash
# Linux only
./scripts/release.sh 0.2.0

# macOS only (requires macOS)
./scripts/release.sh 0.2.0 mac

# Both platforms
./scripts/release.sh 0.2.0 all
```

Le script:
1. Update `package.json` version
2. Commit + tag `v0.2.0`
3. Build les packages
4. Push to remote

Ensuite:
1. Aller sur [GitHub Releases](https://github.com/YOUR-ORG/agent-helpers/releases/new)
2. Créer release pour tag `v0.2.0`
3. Uploader les packages:
   - `agent-helpers_0.2.0_amd64.deb` (Linux)
   - `agent-helpers-0.2.0.dmg` (macOS)
4. Notifier l'équipe

### Équipe: Installer/mettre à jour

**Linux:**
```bash
wget https://github.com/YOUR-ORG/agent-helpers/releases/download/v0.2.0/agent-helpers_0.2.0_amd64.deb
sudo dpkg -i agent-helpers_0.2.0_amd64.deb
```

**macOS:**
```bash
curl -L -O https://github.com/YOUR-ORG/agent-helpers/releases/download/v0.2.0/agent-helpers-0.2.0.dmg
open agent-helpers-0.2.0.dmg
# Glisser dans Applications
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

Configure via Settings page dans l'app.

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

## Contribuer

Forkez le repo et créez une PR. Focus sur:
- Amélioration éditeur
- Templates customizations
- UX/UI enhancements

## License

MIT
