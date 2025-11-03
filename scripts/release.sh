#!/bin/bash
set -e

# Script de release pour Agent Helpers
# Usage: ./scripts/release.sh [version] [platform]
# Exemples:
#   ./scripts/release.sh 0.2.0        # Build Linux only
#   ./scripts/release.sh 0.2.0 mac    # Build macOS only
#   ./scripts/release.sh 0.2.0 all    # Build both

VERSION=$1
PLATFORM=${2:-linux}

if [ -z "$VERSION" ]; then
  echo "❌ Version manquante"
  echo "Usage: ./scripts/release.sh <version> [platform]"
  echo "Platforms: linux (default), mac, all"
  echo "Exemple: ./scripts/release.sh 0.2.0 all"
  exit 1
fi

echo "🚀 Release Agent Helpers v$VERSION (platform: $PLATFORM)"
echo ""

# 1. Vérifier que git est propre
if [[ -n $(git status -s) ]]; then
  echo "❌ Git working directory not clean. Commit or stash changes first."
  exit 1
fi

# 2. Update version dans package.json
echo "📝 Updating package.json version to $VERSION..."
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

# 3. Commit version bump
git add package.json
git commit -m "chore: bump version to $VERSION"

# 4. Tag
echo "🏷️  Creating git tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# 5. Build
echo "🔨 Building application..."

if [ "$PLATFORM" = "all" ]; then
  npm run build:all
elif [ "$PLATFORM" = "mac" ]; then
  npm run build:mac
else
  npm run build:linux
fi

# 6. Verify build
echo ""
echo "📦 Built packages:"

if [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "all" ]; then
  DEB_FILE="dist/agent-helpers_${VERSION}_amd64.deb"
  if [ -f "$DEB_FILE" ]; then
    DEB_SIZE=$(ls -lh "$DEB_FILE" | awk '{print $5}')
    echo "  ✅ Linux: $DEB_FILE ($DEB_SIZE)"
  else
    echo "  ❌ Linux build failed"
  fi
fi

if [ "$PLATFORM" = "mac" ] || [ "$PLATFORM" = "all" ]; then
  DMG_FILE="dist/agent-helpers-${VERSION}.dmg"
  if [ -f "$DMG_FILE" ]; then
    DMG_SIZE=$(ls -lh "$DMG_FILE" | awk '{print $5}')
    echo "  ✅ macOS: $DMG_FILE ($DMG_SIZE)"
  else
    echo "  ❌ macOS build failed (requires macOS to build)"
  fi
fi

# 7. Push
echo "📤 Pushing to remote..."
git push origin main
git push origin "v$VERSION"

echo ""
echo "✅ Release v$VERSION complete!"
echo ""
echo "📦 Package: $DEB_FILE"
echo ""
echo "Next steps:"
echo "1. Create GitHub release: https://github.com/YOUR-ORG/agent-helpers/releases/new?tag=v$VERSION"
echo "2. Upload packages:"
if [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "all" ]; then
  echo "   - agent-helpers_${VERSION}_amd64.deb (Linux)"
fi
if [ "$PLATFORM" = "mac" ] || [ "$PLATFORM" = "all" ]; then
  echo "   - agent-helpers-${VERSION}.dmg (macOS)"
fi
echo "3. Notify team members"
echo ""
echo "Team installation:"
if [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "all" ]; then
  echo "Linux:"
  echo "  wget https://github.com/YOUR-ORG/agent-helpers/releases/download/v$VERSION/agent-helpers_${VERSION}_amd64.deb"
  echo "  sudo dpkg -i agent-helpers_${VERSION}_amd64.deb"
fi
if [ "$PLATFORM" = "mac" ] || [ "$PLATFORM" = "all" ]; then
  echo "macOS:"
  echo "  curl -L -O https://github.com/YOUR-ORG/agent-helpers/releases/download/v$VERSION/agent-helpers-${VERSION}.dmg"
  echo "  open agent-helpers-${VERSION}.dmg"
fi
