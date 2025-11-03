#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Copy .next/static to standalone/.next/static
const staticSrc = path.join(process.cwd(), '.next/static');
const staticDest = path.join(process.cwd(), '.next/standalone/.next/static');

console.log('Copying static files for standalone...');

if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('✓ Copied .next/static');
}

// Copy public to standalone/public
const publicSrc = path.join(process.cwd(), 'public');
const publicDest = path.join(process.cwd(), '.next/standalone/public');

if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('✓ Copied public');
}

console.log('Post-build complete!');
