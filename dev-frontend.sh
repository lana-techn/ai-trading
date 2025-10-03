#!/bin/bash

# Simple Frontend Development Script
# Fixes ulimit issues and runs frontend only

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 AI Trading Agent - Frontend Only${NC}"
echo "===================================="

# Fix ulimit issues
echo -e "${YELLOW}📊 Setting up file limits...${NC}"
ulimit -n 65536
echo "✅ File limit set to $(ulimit -n)"

echo -e "\n${GREEN}Starting frontend server...${NC}"
echo "Frontend: http://localhost:3000"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Start frontend
cd frontend
pnpm dev