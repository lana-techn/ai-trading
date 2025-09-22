#!/bin/bash

# Optimized Frontend Starter for AI Trading Agent
echo "🎨 Starting Frontend Server with pnpm..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
PORT=3000

cd "$FRONTEND_DIR"

# Kill any existing server on port 3000
echo "Checking for existing processes on port $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo "Installing dependencies with pnpm..."
    pnpm install
fi

# Start the server with pnpm
echo "Starting Next.js dev server on http://localhost:$PORT with pnpm"
pnpm dev
