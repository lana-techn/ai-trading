#!/bin/bash

# Simple AI Trading Agent Development Script
# Fixes ulimit issues and runs both servers

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Trading Agent - Simple Development Mode${NC}"
echo "================================================="

# Fix ulimit issues
echo -e "${YELLOW}📊 Setting up file limits...${NC}"
ulimit -n 65536
echo "✅ File limit set to $(ulimit -n)"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🔄 Shutting down servers...${NC}"
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "nest start" 2>/dev/null || true
    echo "✅ Development environment stopped"
    exit 0
}

# Trap cleanup function
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}Starting servers...${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Start backend in background
echo "🔧 Starting backend..."
cd backend
pnpm start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend in foreground (so we can see the output)
echo "🎨 Starting frontend..."
cd frontend
pnpm dev

# If frontend exits, cleanup backend
cleanup