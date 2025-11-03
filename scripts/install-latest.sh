#!/bin/bash
set -e

# Script d'installation rapide pour équipe
# Usage: curl -fsSL https://raw.githubusercontent.com/AlexisLaporte/agent-helpers/main/scripts/install-latest.sh | bash
# Ou: ./scripts/install-latest.sh

REPO="AlexisLaporte/agent-helpers"
INSTALL_DIR="/tmp/agent-helpers-install"

echo "🚀 Installing Agent Helpers (latest version)"
echo ""

# Detect latest version from GitHub
echo "📡 Fetching latest version..."
LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

if [ -z "$LATEST_VERSION" ]; then
  echo "❌ Could not detect latest version"
  echo "Please install manually from: https://github.com/$REPO/releases"
  exit 1
fi

echo "✅ Latest version: $LATEST_VERSION"

# Download
DEB_FILE="agent-helpers_${LATEST_VERSION}_amd64.deb"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$LATEST_VERSION/$DEB_FILE"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "⬇️  Downloading $DEB_FILE..."
curl -fsSL -o "$DEB_FILE" "$DOWNLOAD_URL"

if [ ! -f "$DEB_FILE" ]; then
  echo "❌ Download failed"
  exit 1
fi

DEB_SIZE=$(ls -lh "$DEB_FILE" | awk '{print $5}')
echo "✅ Downloaded: $DEB_FILE ($DEB_SIZE)"

# Install
echo "📦 Installing..."
sudo dpkg -i "$DEB_FILE"

# Cleanup
cd - > /dev/null
rm -rf "$INSTALL_DIR"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Launch with:"
echo "  agent-helpers"
echo ""
echo "Or from: Applications → Development → Agent Helpers"
