#!/bin/bash

# Test setup script for AI Trading Agent

echo "🧪 Testing AI Trading Agent Setup..."
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if pnpm is installed
echo "1. Checking pnpm installation..."
pnpm --version > /dev/null 2>&1
test_result $? "pnpm is installed"

# Test 2: Check frontend directory and pnpm-lock.yaml
echo "2. Checking frontend migration..."
if [ -f "frontend/pnpm-lock.yaml" ]; then
    test_result 0 "pnpm-lock.yaml exists"
else
    test_result 1 "pnpm-lock.yaml missing"
fi

# Test 3: Check if node_modules was migrated
echo "3. Checking node_modules..."
if [ -d "frontend/node_modules" ]; then
    test_result 0 "Frontend node_modules exists"
else
    test_result 1 "Frontend node_modules missing"
fi

# Test 4: Check script permissions
echo "4. Checking script permissions..."
if [ -x "dev.sh" ]; then
    test_result 0 "dev.sh is executable"
else
    test_result 1 "dev.sh is not executable"
fi

# Test 5: Check root package.json
echo "5. Checking root package.json..."
if [ -f "package.json" ]; then
    test_result 0 "Root package.json exists"
else
    test_result 1 "Root package.json missing"
fi

# Test 6: Check pnpm workspace
echo "6. Checking pnpm workspace..."
if [ -f "pnpm-workspace.yaml" ]; then
    test_result 0 "pnpm-workspace.yaml exists"
else
    test_result 1 "pnpm-workspace.yaml missing"
fi

# Test 7: Check backend files
echo "7. Checking backend files..."
if [ -f "backend/minimal_server.py" ]; then
    test_result 0 "Backend server file exists"
else
    test_result 1 "Backend server file missing"
fi

# Test 8: Test frontend package.json scripts
echo "8. Testing pnpm commands..."
cd frontend
pnpm run --help > /dev/null 2>&1
test_result $? "pnpm run commands work"
cd ..

# Summary
echo ""
echo "=================================="
echo "🧪 Test Summary:"
echo "✅ Tests passed: $TESTS_PASSED"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests failed: $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}🎉 All tests passed!${NC}"
fi
echo ""

# Quick start instructions
echo "🚀 Quick Start Commands:"
echo "  ./dev.sh               # Start both servers"
echo "  pnpm dev               # Alternative: Start both servers"
echo "  ./dev.sh frontend      # Start only frontend"
echo "  ./dev.sh backend       # Start only backend"
echo "  ./dev.sh status        # Check server status"
echo "  ./dev.sh help          # Show help"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup looks good! Ready to start development.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the setup.${NC}"
    exit 1
fi