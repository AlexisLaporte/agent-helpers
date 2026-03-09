# Claude Code Manager

App desktop (Tauri) pour gérer les configurations Claude Code : fichiers, skills, commands, settings, sessions.

## Stack
- **Frontend** : TypeScript, Vite, Monaco Editor
- **Backend** : Rust (Tauri 2.0)
- **Deps système** : libgtk-3-dev, libwebkit2gtk-4.1-dev, libsoup-3.0-dev

## Architecture
```
apps/desktop-tauri/
├── src/                    # Frontend TypeScript
│   ├── main.ts             # App entry, sidebar toggle (Files/Sessions)
│   ├── components/
│   │   ├── Editor.ts       # Monaco editor, tabs, save
│   │   ├── FileTree.ts     # 3-zone file tree (Primary/Target/System)
│   │   ├── ProjectSelector.ts  # Project discovery dropdown
│   │   └── SessionsView.ts    # Sessions browser par projet
│   ├── styles/main.css
│   ├── templates.ts        # Ghost file templates
│   └── updater.ts          # Auto-update check
├── src-tauri/src/
│   ├── lib.rs              # Core: filesystem, projects, sessions
│   └── main.rs             # Tauri commands registration
└── index.html
```

## Commands
- `npm run dev` — dev server (frontend)
- `npm run build` — build release
- `cargo check` — vérifier compilation Rust (dans `apps/desktop-tauri/src-tauri/`)

## Release
- Tag `desktop-v*` déclenche le workflow GitHub Actions

## Conventions
- Fichiers < 500 lignes
- Frontend/backend séparés par IPC Tauri (`window.__TAURI__.core.invoke`)
- Zones fichiers : Primary (CLAUDE.md), Target (skills, commands, settings), System (reste)
- Sessions : lues depuis `~/.claude/projects/<slug>/*.jsonl`

## Skills
Les skills sont dans un repo séparé : `AlexisLaporte/claude-skills`
- API statique GitHub Pages : `https://alexislaporte.github.io/claude-skills/api/skills.json`
- tuls.me consomme cette API (plus de lecture filesystem)
