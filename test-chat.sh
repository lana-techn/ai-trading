#!/bin/bash

# Test Chat Functionality Script
# Verifies that frontend can communicate with backend API

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 AI Trading Agent - Chat Functionality Test${NC}"
echo "=============================================="

# Function to test API endpoint
test_api() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    local expected_status=${4:-200}
    
    echo -e "${YELLOW}Testing: $method $endpoint${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "http://localhost:$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            "http://localhost:$endpoint")
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ Success: HTTP $http_code${NC}"
        if [ -n "$body" ] && [ "$body" != "{}" ]; then
            echo "   Response: $(echo $body | jq -c . 2>/dev/null || echo $body)"
        fi
        return 0
    else
        echo -e "${RED}❌ Failed: HTTP $http_code (expected $expected_status)${NC}"
        echo "   Response: $body"
        return 1
    fi
}

# Test 1: Backend Health Check
echo -e "\n${BLUE}🔧 Testing Backend Health${NC}"
if test_api "8000/api/v1/health" "GET"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Test 2: Frontend Accessibility  
echo -e "\n${BLUE}🎨 Testing Frontend Accessibility${NC}"
if test_api "3000" "GET" "" "200"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
    exit 1
fi

# Test 3: Chat Page Accessibility
echo -e "\n${BLUE}💬 Testing Chat Page${NC}"
if test_api "3000/chat" "GET" "" "200"; then
    echo -e "${GREEN}✅ Chat page is accessible${NC}"
else
    echo -e "${RED}❌ Chat page not accessible${NC}"
    exit 1
fi

# Test 4: Basic Chat API
echo -e "\n${BLUE}🤖 Testing Chat API${NC}"
chat_data='{"message":"Hello World","session_id":"test_session"}'
if test_api "8000/api/v1/chat" "POST" "$chat_data" "201"; then
    echo -e "${GREEN}✅ Chat API is working${NC}"
else
    echo -e "${RED}❌ Chat API failed${NC}"
    exit 1
fi

# Test 5: Symbol Analysis Chat
echo -e "\n${BLUE}📊 Testing Symbol Analysis${NC}"
analysis_data='{"message":"Analyze BTC-USD","session_id":"test_session"}'
if test_api "8000/api/v1/chat" "POST" "$analysis_data" "201"; then
    echo -e "${GREEN}✅ Symbol analysis is working${NC}"
else
    echo -e "${RED}❌ Symbol analysis failed${NC}"
    exit 1
fi

# Test 6: Chat History
echo -e "\n${BLUE}📚 Testing Chat History${NC}"
if test_api "8000/api/v1/chat/history/test_session" "GET" "" "200"; then
    echo -e "${GREEN}✅ Chat history is working${NC}"
else
    echo -e "${RED}❌ Chat history failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 All tests passed! Chat functionality is working correctly.${NC}"
echo -e "${BLUE}📝 Summary:${NC}"
echo "   ✅ Backend health check"
echo "   ✅ Frontend accessibility"  
echo "   ✅ Chat page accessibility"
echo "   ✅ Basic chat API"
echo "   ✅ Symbol analysis"
echo "   ✅ Chat history"
echo ""
echo -e "${YELLOW}🚀 You can now use the chat at: http://localhost:3000/chat${NC}"