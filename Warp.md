# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Project Setup & Initialization
```bash
# Complete project setup with native modules (SQLite, etc.)
pnpm setup

# Alternative: legacy installation
pnpm install:all

# Test the entire setup to ensure everything works
./dev.sh test
```

### Primary Development
```bash
# RECOMMENDED: Simple development scripts (fixes ulimit issues)
./dev-simple.sh     # Start both frontend and backend
./dev-frontend.sh   # Next.js frontend only (port 3000)
./dev-backend.sh    # NestJS backend only (port 8000)

# Alternative: Original complex script
./dev.sh            # Full development environment
pnpm dev            # Same as above

# Development utilities
./dev.sh status     # Check server status
./dev.sh stop       # Stop all servers
./dev.sh clean      # Clean dependencies and restart
```

### Workspace Commands
```bash
# Backend (NestJS/TypeScript)
pnpm backend:start:dev    # Development mode with watch
pnpm backend:build        # Compile TypeScript to dist/
pnpm backend:start        # Run compiled production build
pnpm backend:test         # Run Jest tests
pnpm backend:lint         # ESLint validation

# Frontend (Next.js 15)
pnpm frontend:build       # Production build with Turbopack
pnpm frontend:start       # Start production build
pnpm frontend:install     # Install frontend dependencies only

# Build & Production
pnpm build               # Build both frontend and backend
pnpm start               # Start production builds
```

### Testing & Quality Assurance
```bash
# Setup verification
./dev.sh test           # Comprehensive setup test including frontend stability
./scripts/test_setup.sh # Backend-focused setup verification

# Linting
pnpm lint               # Frontend ESLint

# Type checking
cd frontend && pnpm type-check  # TypeScript validation
```

## Architecture Overview

### Full-Stack Hybrid Architecture
This is a **pnpm workspace** containing two main applications that work together:

**Backend (NestJS/TypeScript)** - Port 8000
- **Modular Architecture**: Built with NestJS modules for scalability
- **Database Layer**: TypeORM with SQLite (default) or PostgreSQL support
- **AI Integration**: Chat service with Gemini AI integration
- **Real-time Communication**: WebSocket gateway for live market data
- **Background Services**: Scheduled analytics and audit logging

**Frontend (Next.js 15/React 19)** - Port 3000
- **App Router**: Next.js 15 with app directory structure
- **Real-time UI**: Advanced chat interface with AI assistant
- **Theme System**: Light/dark mode with next-themes
- **Authentication**: Clerk integration for user management
- **Charts & Trading**: Lightweight-charts and ApexCharts for market visualization

### Key Backend Modules

```
backend/src/modules/
├── analysis/          # Technical analysis & trading recommendations
├── chat/             # AI chat service with Gemini integration
├── market-data/      # Market data aggregation (Alpha Vantage + synthetic)
├── tutorials/        # Trading education content management
├── health/           # Health check endpoints
├── websocket/        # Real-time data streaming (Socket.IO)
└── audit/            # AI decision audit logging
```

### Frontend Application Structure

```
frontend/app/
├── chat/             # AI chat interface page
├── analysis/         # Trading analysis dashboard
├── charts/           # Market charts and visualization
├── dashboard/        # Main trading dashboard
├── trading/          # Trading interface
└── portfolio/        # Portfolio management
```

### Database & Persistence
- **Primary**: SQLite with TypeORM (auto-created at `backend/data/trader-ai.sqlite`)
- **Production**: PostgreSQL support via environment configuration
- **Entities**: Tutorials, sections, tags, analytics, and audit logs
- **Migrations**: Automatic TypeORM entity synchronization

## Development Environment

### Required Dependencies
- **Node.js**: 18+ (both frontend and backend)
- **pnpm**: 8+ (preferred package manager)
- **Native Modules**: SQLite3, Sharp (handled by setup scripts)

### Environment Configuration
```bash
# Backend configuration (.env)
NODE_ENV=development
PORT=8000
CORS_ORIGINS=http://localhost:3000

# Database (SQLite default)
DB_TYPE=sqlite
DB_PATH=./data/trader-ai.sqlite

# AI Services
ALPHA_VANTAGE_API_KEY=your-key
CHAT_MEMORY_LIMIT=20
```

### Port Configuration
- **Frontend**: 3000 (Next.js)
- **Backend**: 8000 (NestJS)
- **WebSocket**: 8000/ws (Socket.IO gateway)

## Important Development Notes

### Package Management
- Uses **pnpm workspaces** for efficient dependency management
- Native modules (SQLite3, Sharp) require build approval: `pnpm approve-builds`
- Backend and frontend have separate `node_modules` but share common dependencies

### Development Workflow
1. Run `./dev.sh` to start both services simultaneously
2. Frontend compilation can take 20-90 seconds on first run (Next.js 15 + Turbopack)
3. Backend starts faster (~5-10 seconds) with NestJS watch mode
4. Both services auto-reload on file changes

### AI & Trading Features
- **Hybrid AI**: Combines Qwen (technical analysis) with Gemini (conversational)
- **Educational Focus**: Trading education with risk management emphasis
- **Synthetic Data**: Fallback to synthetic market data when APIs unavailable
- **Real-time Updates**: WebSocket streaming for live market data

### Migration Context
Recently migrated from FastAPI (Python) to NestJS (TypeScript) while maintaining feature parity. All trading analysis, chat capabilities, and market data services are now TypeScript-based with improved scalability and maintainability.

## Troubleshooting

### File Limit Issues (macOS)
If you encounter "Too many open files" errors, use the simple scripts which automatically fix ulimit:

```bash
# These scripts automatically set ulimit -n 65536
./dev-simple.sh     # Recommended for development
./dev-frontend.sh   # Frontend only
./dev-backend.sh    # Backend only
```

**Manual fix (if needed):**
```bash
# Increase file limits for current session
ulimit -n 65536

# System-wide fix (requires admin)
sudo launchctl limit maxfiles 65536 200000
```

### Frontend Compilation Time
- **First run**: 30-90 seconds (Next.js 15 + many dependencies)
- **Subsequent runs**: 3-10 seconds (with cache)
- **Solution**: Be patient on first compilation
