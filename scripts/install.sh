#!/bin/bash
set -e

REPO="AlexisLaporte/claude-code-manager"
TEMP_DIR=$(mktemp -d)

echo "🔍 Fetching latest release..."
LATEST=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

if [ -z "$LATEST" ]; then
  echo "❌ Could not find latest release"
  exit 1
fi

echo "📦 Downloading $LATEST..."
DEB_URL="https://github.com/$REPO/releases/download/$LATEST/claude-code-manager_${LATEST#desktop-v}_amd64.deb"

curl -fsSL "$DEB_URL" -o "$TEMP_DIR/claude-code-manager.deb" || {
  # Try alternate naming pattern
  DEB_URL="https://github.com/$REPO/releases/download/$LATEST/Claude.Code.Manager_${LATEST#desktop-v}_amd64.deb"
  curl -fsSL "$DEB_URL" -o "$TEMP_DIR/claude-code-manager.deb"
}

echo "🔧 Installing..."
sudo dpkg -i "$TEMP_DIR/claude-code-manager.deb"

echo "🧹 Cleanup..."
rm -rf "$TEMP_DIR"

echo "✅ Claude Code Manager installed!"
echo "   Run: claude-code-manager"
