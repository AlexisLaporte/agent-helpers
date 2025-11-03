#!/bin/bash
set -e

# Agent Helpers installer
# Usage: curl -fsSL https://raw.githubusercontent.com/AlexisLaporte/agent-helpers/master/scripts/install-latest.sh | bash

REPO="AlexisLaporte/agent-helpers"
INSTALL_DIR="/tmp/agent-helpers-install"

echo "🚀 Installing Agent Helpers"
echo ""

# Detect OS
OS="$(uname -s)"
case "$OS" in
  Linux*)   PLATFORM="linux" ;;
  Darwin*)  PLATFORM="macos" ;;
  *)
    echo "❌ Unsupported OS: $OS"
    echo "Please install manually from: https://github.com/$REPO/releases"
    exit 1
    ;;
esac

echo "🖥️  Platform: $PLATFORM"

# Detect latest version from GitHub
echo "📡 Fetching latest version..."
LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

if [ -z "$LATEST_VERSION" ]; then
  echo "❌ Could not detect latest version"
  echo "Please install manually from: https://github.com/$REPO/releases"
  exit 1
fi

echo "✅ Latest version: v$LATEST_VERSION"
echo ""

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download and install based on platform
if [ "$PLATFORM" = "linux" ]; then
  FILE="agent-helpers_${LATEST_VERSION}_amd64.deb"
  DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$LATEST_VERSION/$FILE"

  echo "⬇️  Downloading $FILE..."
  curl -fsSL -o "$FILE" "$DOWNLOAD_URL"

  if [ ! -f "$FILE" ]; then
    echo "❌ Download failed"
    exit 1
  fi

  FILE_SIZE=$(ls -lh "$FILE" | awk '{print $5}')
  echo "✅ Downloaded: $FILE ($FILE_SIZE)"
  echo ""

  echo "📦 Installing (requires sudo)..."
  sudo dpkg -i "$FILE"

  echo ""
  echo "✅ Installation complete!"
  echo ""
  echo "Launch with:"
  echo "  agent-helpers"
  echo ""

elif [ "$PLATFORM" = "macos" ]; then
  FILE="agent-helpers-${LATEST_VERSION}.dmg"
  DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$LATEST_VERSION/$FILE"

  echo "⬇️  Downloading $FILE..."
  curl -fsSL -o "$FILE" "$DOWNLOAD_URL"

  if [ ! -f "$FILE" ]; then
    echo "❌ Download failed"
    exit 1
  fi

  FILE_SIZE=$(ls -lh "$FILE" | awk '{print $5}')
  echo "✅ Downloaded: $FILE ($FILE_SIZE)"
  echo ""

  echo "📦 Opening installer..."
  open "$FILE"

  echo ""
  echo "✅ Installer opened!"
  echo ""
  echo "Please:"
  echo "  1. Drag 'Agent Helpers' to Applications folder"
  echo "  2. Open from Applications"
  echo ""
fi

# Cleanup
cd - > /dev/null
rm -rf "$INSTALL_DIR"
