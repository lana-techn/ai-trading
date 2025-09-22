#!/bin/bash

# AI Trading Agent Development Startup Script
echo "🚀 Starting AI Trading Agent Development Environment..."

# Function to cleanup processes on exit
cleanup() {
    echo "🔄 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap signals to ensure proper cleanup
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server (port 8000)..."
cd backend
python3 minimal_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server (port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo "✅ Development environment ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🤖 Backend:  http://localhost:8000"
echo "💬 AI Chat:  http://localhost:3000/chat"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID