#!/bin/bash

# Simple Backend Starter for AI Trading Agent
echo "🔧 Starting Backend Server..."

cd /Users/em/web/trader-ai-agent/backend

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start the server
echo "Starting minimal_server.py on http://localhost:8000"
python3 minimal_server.py