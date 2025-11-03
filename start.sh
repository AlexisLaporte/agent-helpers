#!/bin/bash

# Agent Helpers - Start Script

PROJECT_DIR="/data/dev/agent-helpers"

echo "🚀 Starting Agent Helpers..."
echo ""

# Check if node_modules exists
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$PROJECT_DIR" && npm install
    echo ""
fi

# Detect port from .env.local to display correct URL
PORT=3000
if [ -f "$PROJECT_DIR/.env.local" ]; then
    # Extract PORT from .env.local if it exists
    ENV_PORT=$(grep "^PORT=" "$PROJECT_DIR/.env.local" | cut -d'=' -f2)
    if [ ! -z "$ENV_PORT" ]; then
        PORT=$ENV_PORT
    fi
fi

# Start the dev server (npm run dev reads .env.local automatically via scripts/dev.js)
echo "▶️  Starting Next.js dev server..."
echo "📍 Open: http://localhost:$PORT"
echo ""
echo "💡 Tip: Configure custom port in .env.local (copy from .env.local.example)"
echo ""

cd "$PROJECT_DIR" && npm run dev
