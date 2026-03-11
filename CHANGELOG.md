# Changelog

All notable changes to Claude Code Manager.

## [0.3.1] - 2026-03-11

### Fixed
- Auto-updater : signature des releases (l'update échouait silencieusement)
- Auto-updater : l'overlay "mise à jour en cours" ne bloquait plus l'app en cas d'erreur

## [0.3.0] - 2026-03-10

### Added
- **Sessions dashboard** — vue principale au démarrage, liste chronologique des sessions récentes groupées par jour
- **Session reader** — lecture des conversations en bulles (user/assistant) au clic sur une session
- **Sidebar toggle** — switch Files / Sessions dans la sidebar

### Changed
- Skills déplacés vers le repo dédié [claude-skills](https://github.com/AlexisLaporte/claude-skills)
- L'API skills est servie en statique via GitHub Pages

## [0.2.0] - 2026-02-15

### Added
- Auto-updater intégré (check des nouvelles versions au démarrage)
- Script d'installation (`curl | bash`)
- Bibliothèque de 10 skills publics (session, git-commit, have-image, up:context, etc.)

### Changed
- Migration Electron → Tauri (app plus légère, accès filesystem natif)

## [0.1.0] - 2026-02-01

### Added
- Vue 3 zones : Primary (CLAUDE.md), Target (skills, commands, settings), System
- Éditeur Monaco avec tabs, sauvegarde Ctrl+S, détection de changements externes
- Découverte automatique des projets Claude
- Ghost files pour créer les fichiers recommandés manquants
- File watching en temps réel
