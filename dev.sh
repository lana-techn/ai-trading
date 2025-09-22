#!/bin/bash

# AI Trading Agent - Optimized Development Environment
# Enhanced startup script with better process management

set -e  # Exit on any error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=3000
PIDFILE="$SCRIPT_DIR/.dev_pids"

# Print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Killing existing process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to cleanup processes on exit
cleanup() {
    print_status "🔄 Shutting down development environment..."
    
    if [[ -f "$PIDFILE" ]]; then
        while IFS= read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                print_status "Terminating process $pid"
                kill "$pid" 2>/dev/null || true
            fi
        done < "$PIDFILE"
        rm -f "$PIDFILE"
    fi
    
    # Kill any remaining processes on our ports
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    print_success "Development environment stopped"
    exit 0
}

# Function to start backend
start_backend() {
    print_status "🔧 Starting backend server..."
    
    if [[ ! -d "$BACKEND_DIR" ]]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Check if virtual environment exists and activate it
    if [[ -d "venv" ]]; then
        print_info "Activating Python virtual environment"
        source venv/bin/activate
    fi
    
    # Check if minimal_server.py exists
    if [[ ! -f "minimal_server.py" ]]; then
        print_error "minimal_server.py not found in backend directory"
        exit 1
    fi
    
    # Start backend in background
    python3 minimal_server.py &
    BACKEND_PID=$!
    echo "$BACKEND_PID" >> "$PIDFILE"
    
    print_info "Backend PID: $BACKEND_PID"
    
    # Wait for backend to start
    local attempts=0
    while ! check_port $BACKEND_PORT && [ $attempts -lt 30 ]; do
        sleep 1
        attempts=$((attempts + 1))
    done
    
    if check_port $BACKEND_PORT; then
        print_success "Backend server started on http://localhost:$BACKEND_PORT"
    else
        print_error "Backend failed to start on port $BACKEND_PORT"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "🎨 Starting frontend server..."
    
    if [[ ! -d "$FRONTEND_DIR" ]]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [[ ! -d "node_modules" ]]; then
        print_info "Installing frontend dependencies with pnpm..."
        pnpm install
    fi
    
    # Start frontend with pnpm
    print_info "Starting Next.js with pnpm..."
    pnpm dev &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" >> "$PIDFILE"
    
    print_info "Frontend PID: $FRONTEND_PID"
    
    # Wait for frontend to start
    local attempts=0
    while ! check_port $FRONTEND_PORT && [ $attempts -lt 60 ]; do
        sleep 1
        attempts=$((attempts + 1))
    done
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend server started on http://localhost:$FRONTEND_PORT"
    else
        print_error "Frontend failed to start on port $FRONTEND_PORT"
        exit 1
    fi
}

# Function to show status
show_status() {
    echo -e "\n${PURPLE}🚀 AI Trading Agent Development Environment${NC}"
    echo -e "${PURPLE}================================================${NC}"
    echo -e "${GREEN}📱 Frontend: ${NC}http://localhost:$FRONTEND_PORT"
    echo -e "${GREEN}🤖 Backend:  ${NC}http://localhost:$BACKEND_PORT"
    echo -e "${GREEN}💬 AI Chat:  ${NC}http://localhost:$FRONTEND_PORT/chat"
    echo -e "${GREEN}📊 Analysis: ${NC}http://localhost:$FRONTEND_PORT/analysis"
    echo -e "\n${YELLOW}💡 Press Ctrl+C to stop all servers${NC}\n"
}

# Function to show help
show_help() {
    echo "AI Trading Agent Development Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start, dev, -d    Start both frontend and backend servers (default)"
    echo "  backend, be, -b   Start only backend server"
    echo "  frontend, fe, -f  Start only frontend server"
    echo "  stop, -s          Stop all running servers"
    echo "  status, -st       Show server status"
    echo "  clean, -c         Clean all dependencies and restart"
    echo "  help, -h          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                Start development environment"
    echo "  $0 backend        Start only backend"
    echo "  $0 frontend       Start only frontend"
    echo "  $0 stop           Stop all servers"
}

# Function to stop servers
stop_servers() {
    cleanup
}

# Function to show server status
show_server_status() {
    echo -e "\n${PURPLE}Server Status:${NC}"
    
    if check_port $BACKEND_PORT; then
        echo -e "${GREEN}✅ Backend:  Running on port $BACKEND_PORT${NC}"
    else
        echo -e "${RED}❌ Backend:  Not running${NC}"
    fi
    
    if check_port $FRONTEND_PORT; then
        echo -e "${GREEN}✅ Frontend: Running on port $FRONTEND_PORT${NC}"
    else
        echo -e "${RED}❌ Frontend: Not running${NC}"
    fi
    echo ""
}

# Function to clean and restart
clean_restart() {
    print_status "🧹 Cleaning dependencies and cache..."
    
    # Stop any running servers
    stop_servers 2>/dev/null || true
    
    # Clean frontend
    if [[ -d "$FRONTEND_DIR" ]]; then
        cd "$FRONTEND_DIR"
        rm -rf node_modules .next pnpm-lock.yaml
        print_info "Frontend cleaned"
    fi
    
    # Clean backend cache
    if [[ -d "$BACKEND_DIR" ]]; then
        cd "$BACKEND_DIR"
        find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
        find . -name "*.pyc" -delete 2>/dev/null || true
        print_info "Backend cache cleaned"
    fi
    
    print_success "Cleanup completed"
    print_status "Starting fresh development environment..."
    
    # Restart
    start_servers
}

# Function to start servers based on argument
start_servers() {
    # Trap signals to ensure proper cleanup
    trap cleanup SIGINT SIGTERM EXIT
    
    # Clean previous PID file
    rm -f "$PIDFILE"
    touch "$PIDFILE"
    
    case "$1" in
        "backend"|"be")
            kill_port $BACKEND_PORT
            start_backend
            print_success "Backend-only mode started"
            echo -e "\n${GREEN}🤖 Backend: ${NC}http://localhost:$BACKEND_PORT"
            echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}\n"
            ;;
        "frontend"|"fe")
            kill_port $FRONTEND_PORT
            start_frontend
            print_success "Frontend-only mode started"
            echo -e "\n${GREEN}📱 Frontend: ${NC}http://localhost:$FRONTEND_PORT"
            echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}\n"
            ;;
        *)
            # Start both servers
            kill_port $BACKEND_PORT
            kill_port $FRONTEND_PORT
            
            print_status "🚀 Starting AI Trading Agent Development Environment..."
            
            start_backend
            start_frontend
            
            show_status
            ;;
    esac
    
    # Keep script running and wait for processes
    if [[ -f "$PIDFILE" ]]; then
        while IFS= read -r pid; do
            wait "$pid" 2>/dev/null || true
        done < "$PIDFILE"
    fi
}

# Main script logic
main() {
    case "${1:-start}" in
        "start"|"dev"|"-d"|"")
            start_servers
            ;;
        "backend"|"be"|"-b")
            start_servers "backend"
            ;;
        "frontend"|"fe"|"-f")
            start_servers "frontend"
            ;;
        "stop"|"-s")
            stop_servers
            ;;
        "status"|"-st")
            show_server_status
            ;;
        "clean"|"-c")
            clean_restart
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"