#!/bin/bash

# AI Trading Agent - Server Startup Script
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to cleanup processes on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    print_success "Servers stopped"
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Header
clear
print_header "🚀 AI Trading Agent - Development Environment"
print_header "=============================================="
echo ""

# Check if ports are available
print_status "Checking port availability..."

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null; then
    print_warning "Port 8000 is already in use. Attempting to free it..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    print_warning "Port 3000 is already in use. Attempting to free it..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Check Python and Node availability
print_status "Verifying system requirements..."

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed or not in PATH"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

print_success "System requirements verified"

# Start Backend Server
print_header "🔧 Starting Backend Server..."
cd backend

# Check if minimal_server.py exists
if [ ! -f "minimal_server.py" ]; then
    print_error "minimal_server.py not found in backend directory"
    exit 1
fi

print_status "Starting Python FastAPI server on port 8000..."
python3 minimal_server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Backend server failed to start"
    exit 1
fi

# Test backend health
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "Backend server is running on http://localhost:8000"
else
    print_warning "Backend server started but health check failed"
fi

# Start Frontend Server
print_header "🎨 Starting Frontend Server..."
cd ../frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend directory"
    cleanup
    exit 1
fi

print_status "Starting Next.js development server on port 3000..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Frontend server failed to start"
    print_status "Check frontend.log for details"
    cleanup
    exit 1
fi

# Test frontend health
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Frontend server is running on http://localhost:3000"
else
    print_warning "Frontend server started but may still be loading"
fi

# Display status
print_header "✅ Development Environment Ready!"
echo ""
print_success "📱 Frontend:     http://localhost:3000"
print_success "🤖 Backend API: http://localhost:8000"
print_success "💬 AI Chat:     http://localhost:3000/chat"
print_success "📚 API Docs:    http://localhost:8000/docs"
echo ""
print_status "Backend PID: $BACKEND_PID"
print_status "Frontend PID: $FRONTEND_PID"
echo ""
print_header "🎯 Quick Test Commands:"
echo -e "${CYAN}# Test Backend Health:${NC}"
echo "curl http://localhost:8000/health"
echo ""
echo -e "${CYAN}# Test Chat Endpoint:${NC}"
echo 'curl -X POST http://localhost:8000/api/v1/chat \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '\''{"message": "Hello", "session_id": "test"}'\'
echo ""
print_warning "Press Ctrl+C to stop both servers"

# Keep script running and wait for processes
wait $BACKEND_PID $FRONTEND_PID