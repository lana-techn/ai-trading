#!/bin/bash

# Simple Frontend Starter for AI Trading Agent
echo "🎨 Starting Frontend Server..."

cd /Users/em/web/trader-ai-agent/frontend

# Kill any existing server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the server
echo "Starting Next.js dev server on http://localhost:3000"
npm run dev