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

// Launch next dev with the port
const nextDev = spawn('next', ['dev', '-p', port], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('exit', (code) => {
  process.exit(code);
});
