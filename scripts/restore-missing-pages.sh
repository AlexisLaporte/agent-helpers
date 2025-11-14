#!/bin/bash
set -e

echo "Restoring missing pages from git history..."

# Extract pages from previous commit and fix imports
cd /data/dev/agent-helpers

# Projects page
git show fe4f9a4:app/projects/page.tsx | \
  sed "s|from '@/lib/types'|from '@agent-helpers/core/types'|g" \
  > apps/desktop/app/projects/page.tsx

# Settings/sources page
git show fe4f9a4:app/settings/sources/page.tsx | \
  sed "s|from '@/lib/types'|from '@agent-helpers/core/types'|g" | \
  sed "s|from '@/lib/library-parser'|from '@agent-helpers/core/library-parser'|g" \
  > apps/desktop/app/settings/sources/page.tsx

# Templates page
git show fe4f9a4:app/templates/page.tsx | \
  sed "s|from '@/lib/types'|from '@agent-helpers/core/types'|g" \
  > apps/desktop/app/templates/page.tsx

# Templates/[name] page
git show fe4f9a4:app/templates/\[name\]/page.tsx | \
  sed "s|from '../../../components/InstallButton'|from '@agent-helpers/ui/components/InstallButton'|g" \
  > apps/desktop/app/templates/\[name\]/page.tsx

echo "✓ All pages restored successfully"
