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

# Function to ensure dependencies are properly installed
ensure_dependencies() {
    print_status "🔧 Ensuring all dependencies are properly installed..."
    
    # Go to project root
    cd "$SCRIPT_DIR"
    
    # Check if node_modules exists, if not install everything
    if [[ ! -d "node_modules" ]]; then
        print_info "Installing root dependencies with pnpm..."
        pnpm install
        
        # Approve build scripts for native modules like sqlite3
        print_info "Approving build scripts for native modules..."
        echo "y" | pnpm approve-builds sqlite3 sharp @nestjs/core @tailwindcss/oxide @clerk/shared unrs-resolver 2>/dev/null || true
    fi
    
    # Ensure backend dependencies are installed
    if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
        print_info "Installing backend dependencies..."
        cd "$BACKEND_DIR"
        pnpm install
    fi
    
    # Ensure frontend dependencies are installed
    if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
        print_info "Installing frontend dependencies..."
        cd "$FRONTEND_DIR"
        pnpm install
    fi
}

# Function to start backend
start_backend() {
    print_status "🔧 Starting backend server..."
    
    if [[ ! -d "$BACKEND_DIR" ]]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found in backend directory"
        exit 1
    fi

    # Ensure dependencies are installed
    ensure_dependencies
    
    # Start backend using the correct script from root
    cd "$SCRIPT_DIR"
    BACKEND_LOGFILE="$SCRIPT_DIR/backend.log"
    > "$BACKEND_LOGFILE"  # Clear the log file
    
    # Start backend and redirect to logfile (backend is less interactive, so no tee needed)
    pnpm run backend:start:dev > "$BACKEND_LOGFILE" 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" >> "$PIDFILE"
    
    print_info "Backend PID: $BACKEND_PID (logs: backend.log)"
    
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
        print_info "Showing recent backend logs for debugging:"
        if [ -s "$BACKEND_LOGFILE" ]; then
            echo "==================== Backend Error Logs ===================="
            tail -20 "$BACKEND_LOGFILE"
            echo "============================================================="
        else
            print_warning "No backend logs found in $BACKEND_LOGFILE"
        fi
        print_info "For more details: tail -f backend.log"
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
    
    # Ensure dependencies are installed
    ensure_dependencies
    
    # Clean .next directory to prevent cache issues
    if [[ -d ".next" ]]; then
        print_info "Cleaning .next directory for fresh start..."
        rm -rf .next
    fi
    
    # Start frontend with stable configuration (no turbopack by default)
    print_info "Starting Next.js in stable mode..."
    
    # Use a named pipe for real-time log streaming
    FRONTEND_LOGFILE="$SCRIPT_DIR/frontend.log"
    > "$FRONTEND_LOGFILE"  # Clear the log file
    
    # Start frontend and redirect to both logfile and stdout with better error handling
    (pnpm dev 2>&1 | tee "$FRONTEND_LOGFILE") &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" >> "$PIDFILE"
    
    print_info "Frontend PID: $FRONTEND_PID (logs: frontend.log)"
    
    # Wait for frontend to start with progress indicators
    local attempts=0
    print_info "Waiting for Next.js compilation..."
    while ! check_port $FRONTEND_PORT && [ $attempts -lt 90 ]; do
        sleep 1
        attempts=$((attempts + 1))
        if [ $attempts -eq 20 ]; then
            print_info "Still compiling... Next.js first compile can take time"
        elif [ $attempts -eq 50 ]; then
            print_warning "Taking longer than usual. You can check compilation errors above or in frontend.log"
            # Show last few lines of the log to help with debugging
            if [ -s "$FRONTEND_LOGFILE" ]; then
                print_info "Recent frontend logs:"
                tail -10 "$FRONTEND_LOGFILE" | sed 's/^/  > /'
            fi
        fi
    done
    
    cd "$SCRIPT_DIR"
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend server started on http://localhost:$FRONTEND_PORT"
    else
        print_error "Frontend failed to start on port $FRONTEND_PORT after 90 seconds"
        print_info "Showing recent frontend logs for debugging:"
        if [ -s "$FRONTEND_LOGFILE" ]; then
            echo "==================== Frontend Error Logs ===================="
            tail -20 "$FRONTEND_LOGFILE"
            echo "============================================================="
        else
            print_warning "No frontend logs found in $FRONTEND_LOGFILE"
        fi
        print_info "For more details: tail -f frontend.log"
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
    echo -e "${GREEN}💬 AI Chart:  ${NC}http://localhost:$FRONTEND_PORT/chart"
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
    echo "  test, -t          Test setup and frontend stability"
    echo "  help, -h          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                Start development environment"
    echo "  $0 backend        Start only backend"
    echo "  $0 frontend       Start only frontend"
    echo "  $0 test           Test setup and stability"
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

# Function to test setup
test_setup() {
    print_status "🧵 Testing AI Trading Agent Setup"
    echo "=================================="
    
    # Test SQLite3 installation
    print_status "Testing SQLite3 installation..."
    if [ -d "node_modules/.pnpm/sqlite3"*"/node_modules/sqlite3/build" ]; then
        print_success "SQLite3 is properly built and installed"
    else
        print_error "SQLite3 build directory not found"
        return 1
    fi
    
    # Test workspace configuration
    print_status "Testing pnpm workspace..."
    if [ -f "pnpm-workspace.yaml" ]; then
        print_success "pnpm workspace is configured"
    else
        print_error "pnpm workspace configuration missing"
        return 1
    fi
    
    # Test backend dependencies
    print_status "Testing backend dependencies..."
    if [ -f "backend/package.json" ]; then
        print_success "Backend package.json exists"
    else
        print_error "Backend package.json not found"
        return 1
    fi
    
    # Test frontend dependencies
    print_status "Testing frontend dependencies..."
    if [ -f "frontend/package.json" ]; then
        print_success "Frontend package.json exists"
    else
        print_error "Frontend package.json not found"
        return 1
    fi
    
    # Test frontend stability (quick test)
    print_status "Testing frontend stability..."
    kill_port $FRONTEND_PORT
    cd frontend
    if [ -d ".next" ]; then
        rm -rf .next
    fi
    
    print_info "Starting frontend test (15 seconds timeout)..."
    pnpm dev > ../frontend-test.log 2>&1 &
    TEST_PID=$!
    
    local attempts=0
    while ! check_port $FRONTEND_PORT && [ $attempts -lt 15 ]; do
        sleep 1
        attempts=$((attempts + 1))
    done
    
    kill $TEST_PID 2>/dev/null || true
    cd ..
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend test passed - started in ${attempts} seconds"
        kill_port $FRONTEND_PORT
    else
        print_error "Frontend test failed - did not start within 15 seconds"
        print_info "Check logs: tail -20 frontend-test.log"
        return 1
    fi
    
    print_success "All tests passed! Setup is working correctly."
    echo ""
    print_info "Ready to start development:"
    print_info "  ./dev.sh          - Start both servers"
    print_info "  ./dev.sh backend  - Backend only"
    print_info "  ./dev.sh frontend - Frontend only"
}

# Function to clean and restart
clean_restart() {
    print_status "🧹 Cleaning dependencies and cache..."
    
    # Stop any running servers
    stop_servers 2>/dev/null || true
    
    # Clean root node_modules and lock files
    cd "$SCRIPT_DIR"
    rm -rf node_modules pnpm-lock.yaml
    print_info "Root dependencies cleaned"
    
    # Clean frontend
    if [[ -d "$FRONTEND_DIR" ]]; then
        cd "$FRONTEND_DIR"
        rm -rf node_modules .next pnpm-lock.yaml
        print_info "Frontend cleaned"
    fi
    
    # Clean backend artifacts
    if [[ -d "$BACKEND_DIR" ]]; then
        cd "$BACKEND_DIR"
        rm -rf node_modules dist pnpm-lock.yaml
        print_info "Backend artifacts cleaned"
    fi
    
    # Return to script directory
    cd "$SCRIPT_DIR"
    
    print_success "Cleanup completed"
    print_status "Starting fresh development environment..."
    
    # Reinstall and approve builds
    print_info "Reinstalling dependencies..."
    pnpm install
    
    print_info "Approving build scripts for native modules..."
    echo "y" | pnpm approve-builds sqlite3 sharp @nestjs/core @tailwindcss/oxide @clerk/shared unrs-resolver 2>/dev/null || true
    
    print_success "Dependencies reinstalled with native modules built"
    
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
        "test"|"-t")
            test_setup
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