#!/bin/bash

# Simple Backend Development Script
# Fixes ulimit issues and runs backend only

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 AI Trading Agent - Backend Only${NC}"
echo "==================================="

# Fix ulimit issues
echo -e "${YELLOW}📊 Setting up file limits...${NC}"
ulimit -n 65536
echo "✅ File limit set to $(ulimit -n)"

echo -e "\n${GREEN}Starting backend server...${NC}"
echo "Backend: http://localhost:8000"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Start backend
cd backend
pnpm start:dev