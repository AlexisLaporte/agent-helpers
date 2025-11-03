#!/usr/bin/env node
const { spawn } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Read PORT from .env.local
const envPath = join(__dirname, '..', '.env.local');
let port = '3000'; // default

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  const match = envContent.match(/^PORT=(.+)$/m);
  if (match) {
    port = match[1].trim();
  }
}

// Launch next start with the port
const nextStart = spawn('next', ['start', '-p', port], {
  stdio: 'inherit',
  shell: true
});

nextStart.on('exit', (code) => {
  process.exit(code);
});
