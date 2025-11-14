#!/bin/bash
set -e

echo "🔄 Migrating to apps/ + packages/ structure..."

# Website: landing page only
echo "📦 Setting up website app..."
cp packages/web/app/page.tsx apps/website/app/
cp packages/web/app/layout.tsx apps/website/app/
cp packages/web/app/globals.css apps/website/app/
cp -r packages/web/public/* apps/website/public/
cp packages/web/next.config.ts apps/website/
cp packages/web/middleware.ts apps/website/
cp packages/web/postcss.config.mjs apps/website/
cp packages/web/tsconfig.json apps/website/

# Desktop: everything except landing page
echo "🖥️  Setting up desktop app..."
rsync -av --exclude='page.tsx' packages/web/app/ apps/desktop/app/
cp -r packages/web/lib apps/desktop/
cp -r packages/web/public/* apps/desktop/public/
cp packages/web/next.config.ts apps/desktop/
cp packages/web/middleware.ts apps/desktop/
cp packages/web/postcss.config.mjs apps/desktop/
cp packages/web/tsconfig.json apps/desktop/
cp packages/web/.env.electron apps/desktop/

# Add landing redirect for desktop
cat > apps/desktop/app/page.tsx << 'EOF'
'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/browse');
}
EOF

# UI: shared components
echo "🎨 Extracting shared UI components..."
mkdir -p packages/ui/components
cp -r packages/web/components/* packages/ui/components/

echo "✅ Migration complete!"
echo "Next: Update imports and clean up packages/web/"
