#!/bin/bash

echo "🧪 Testing AI Chat Functionality"
echo "================================="
echo ""

# Test 1: Basic greeting
echo "📝 Test 1: Basic Trading Question"
echo "Question: 'Hello, can you help me learn about trading?'"
echo ""
curl -s -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me learn about trading?", "session_id": "test1"}' | \
  jq -r '.response' | head -10
echo ""
echo "..."
echo ""

# Test 2: Technical question
echo "📈 Test 2: Technical Analysis Question"
echo "Question: 'What is RSI and how do I use it?'"
echo ""
curl -s -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is RSI and how do I use it?", "session_id": "test2"}' | \
  jq -r '.response' | head -10
echo ""
echo "..."
echo ""

# Test 3: Analysis request
echo "📊 Test 3: Analysis Request"
echo "Question: 'Can you analyze BTC-USD for me?'"
echo ""
curl -s -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Can you analyze BTC-USD for me?", "session_id": "test3"}' | \
  jq -r '.response' | head -10
echo ""
echo "..."
echo ""

echo "✅ All tests completed!"
echo ""
echo "🎯 Next Steps:"
echo "• Open http://localhost:3000/chat in your browser"
echo "• Try the chat interface with the AI assistant"
echo "• Test different types of questions (educational, analysis, etc.)"