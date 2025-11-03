# Installation Agent Helpers

Guide d'installation pour votre équipe.

## Prérequis

- **Linux**: Ubuntu/Debian ou autre distro
- **macOS**: 10.13 (High Sierra) ou supérieur
- Node.js installé (pour dev uniquement)

## Installation Linux (.deb)

### 1. Télécharger

**Option A: Depuis GitHub Releases**
```bash
wget https://github.com/votre-org/agent-helpers/releases/download/v0.1.0/agent-helpers_0.1.0_amd64.deb
```

**Option B: Build local**
```bash
git clone https://github.com/votre-org/agent-helpers.git
cd agent-helpers
npm install
npm run build:linux
# Package créé dans: dist/agent-helpers_0.1.0_amd64.deb
```

### 2. Installer

```bash
sudo dpkg -i agent-helpers_0.1.0_amd64.deb
```

### 3. Lancer

```bash
agent-helpers
```

Ou via le menu: **Applications → Development → Agent Helpers**

---

## Installation macOS (.dmg)

### 1. Télécharger

**Option A: Depuis GitHub Releases**
```bash
curl -L -O https://github.com/votre-org/agent-helpers/releases/download/v0.1.0/agent-helpers-0.1.0.dmg
```

**Option B: Build local** (nécessite macOS)
```bash
git clone https://github.com/votre-org/agent-helpers.git
cd agent-helpers
npm install
npm run build:mac
# Package créé dans: dist/agent-helpers-0.1.0.dmg
```

### 2. Installer

1. Double-cliquer sur `agent-helpers-0.1.0.dmg`
2. Glisser "Agent Helpers" dans le dossier Applications
3. Éjecter le volume DMG

### 3. Lancer

- Depuis **Applications** → "Agent Helpers"
- Ou Spotlight: Cmd+Space → "Agent Helpers"

**Note:** Si macOS bloque l'app (non signée), aller dans **Préférences Système → Sécurité** et autoriser.

## Mise à jour

### Linux

```bash
# Télécharger la nouvelle version
wget https://github.com/votre-org/agent-helpers/releases/download/v0.2.0/agent-helpers_0.2.0_amd64.deb

# Installer (remplace automatiquement l'ancienne version)
sudo dpkg -i agent-helpers_0.2.0_amd64.deb
```

### macOS

```bash
# Télécharger
curl -L -O https://github.com/votre-org/agent-helpers/releases/download/v0.2.0/agent-helpers-0.2.0.dmg

# Installer (glisser dans Applications, remplace l'ancienne)
open agent-helpers-0.2.0.dmg
```

### Méthode 2: Pull & rebuild depuis les sources

```bash
cd agent-helpers
git pull origin main
npm install
npm run build:linux
sudo dpkg -i dist/agent-helpers_0.1.0_amd64.deb
```

## Désinstallation

```bash
sudo dpkg -r agent-helpers
```

## Installation pour développement

Si vous voulez contribuer ou tester en dev:

```bash
git clone https://github.com/votre-org/agent-helpers.git
cd agent-helpers
npm install
npm run dev
# Ouvre http://localhost:3011
```

## Workflow d'équipe

### Pour les membres de l'équipe (utilisateurs)

1. **Première installation**
   ```bash
   # Récupérer le .deb depuis votre serveur/releases
   wget https://votre-serveur.com/agent-helpers_latest_amd64.deb
   sudo dpkg -i agent-helpers_latest_amd64.deb
   ```

2. **Mise à jour**
   ```bash
   # Quand une nouvelle version sort
   wget https://votre-serveur.com/agent-helpers_latest_amd64.deb
   sudo dpkg -i agent-helpers_latest_amd64.deb
   ```

3. **Utilisation**
   - Lancer: `agent-helpers` ou menu Applications
   - L'app accède automatiquement à `~/.claude/`

### Pour les mainteneurs (builds)

1. **Créer une release**
   ```bash
   # Modifier version dans package.json
   vim package.json  # version: "0.2.0"

   # Build
   npm run build:linux

   # Upload vers releases ou serveur interne
   scp dist/agent-helpers_0.2.0_amd64.deb votre-serveur:/releases/
   ```

2. **Notifier l'équipe**
   ```
   📦 Nouvelle version Agent Helpers v0.2.0

   Nouveautés:
   - Feature X
   - Bug fix Y

   Installation:
   wget https://votre-serveur.com/agent-helpers_0.2.0_amd64.deb
   sudo dpkg -i agent-helpers_0.2.0_amd64.deb
   ```

## Distribution automatisée (optionnel)

### Option 1: Serveur interne

```bash
# Sur votre serveur HTTP interne
/var/www/releases/
├── agent-helpers_0.1.0_amd64.deb
├── agent-helpers_0.2.0_amd64.deb
└── agent-helpers_latest_amd64.deb → agent-helpers_0.2.0_amd64.deb
```

### Option 2: GitHub Releases

1. Créer un tag:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

2. Créer une release sur GitHub avec le .deb attaché

3. L'équipe télécharge:
   ```bash
   wget https://github.com/org/agent-helpers/releases/download/v0.2.0/agent-helpers_0.2.0_amd64.deb
   ```

### Option 3: Repository APT (avancé)

Pour updates automatiques via `apt update && apt upgrade`:

```bash
# Setup (une fois)
echo "deb [trusted=yes] https://votre-repo.com/apt stable main" | sudo tee /etc/apt/sources.list.d/agent-helpers.list

# Installation
sudo apt update
sudo apt install agent-helpers

# Mises à jour (automatique)
sudo apt update && sudo apt upgrade
```

## Vérification de l'installation

```bash
# Vérifier que le package est installé
dpkg -l | grep agent-helpers

# Vérifier l'exécutable
which agent-helpers
# Output: /usr/bin/agent-helpers

# Tester le lancement
agent-helpers --version  # (si implémenté)
```

## Troubleshooting

### L'app ne lance pas

```bash
# Vérifier les logs
journalctl --user -u agent-helpers

# Tester le serveur standalone directement
cd "/opt/Agent Helpers/resources/app/.next/standalone"
PORT=3011 node server.js
```

### Port 3011 déjà utilisé

```bash
# Trouver le process
lsof -i :3011

# Killer si nécessaire
kill -9 <PID>
```

### Permissions ~/.claude/

```bash
# S'assurer que l'app peut accéder
ls -la ~/.claude/
chmod 755 ~/.claude
```

## Structure après installation

```
/opt/Agent Helpers/           # Application
├── agent-helpers             # Exécutable principal
└── resources/
    └── app/                  # Code Next.js standalone

/usr/bin/agent-helpers        # Symlink vers l'exécutable

~/.claude/                    # Vos données (non touchées)
├── CLAUDE.md
├── skills/
├── commands/
└── ...
```

## Support

- Issues: https://github.com/votre-org/agent-helpers/issues
- Docs: https://github.com/votre-org/agent-helpers/wiki
- Contact: votre-équipe@votre-org.com
