# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an AI-powered trading analysis platform with a Next.js 15 frontend and NestJS backend, using a monorepo structure managed with pnpm workspaces.

## Build and Development Commands

### Quick Start
```bash
# Install all dependencies (use pnpm, not npm or yarn)
pnpm install

# Run both frontend and backend simultaneously
pnpm dev
```

### Individual Services
```bash
# Frontend only (Next.js on port 3000)
pnpm dev:frontend
pnpm dev:frontend --turbo  # With turbopack for faster builds

# Backend only (NestJS on port 8000)
pnpm dev:backend

# Build for production
pnpm build               # Builds both frontend and backend
pnpm frontend:build      # Build frontend only
pnpm backend:build       # Build backend only

# Start production builds
pnpm start
pnpm frontend:start
pnpm backend:start
```

### Testing and Code Quality
```bash
# Linting
pnpm lint                # Lint both frontend and backend

# Backend testing (Jest)
pnpm --filter backend test
pnpm --filter backend test:watch
pnpm --filter backend test:cov

# Type checking (frontend)
pnpm --filter frontend type-check

# Format code (backend)
pnpm --filter backend format

# Clean build artifacts and caches
pnpm clean
```

## Architecture Overview

### Monorepo Structure
The project uses pnpm workspaces to manage two main packages:
- **frontend/**: Next.js 15 application with React 19
- **backend/**: NestJS application with TypeScript

### Backend Architecture (NestJS)

The backend follows NestJS modular architecture with these core modules:

- **DatabaseModule** (`src/database/`): SQLite by default, configurable for PostgreSQL
- **AnalysisModule** (`src/modules/analysis/`): Trading analysis and AI integration
- **MarketDataModule** (`src/modules/market-data/`): Alpha Vantage integration for market data
- **ChatModule** (`src/modules/chat/`): Chat interface with memory management
- **WebsocketModule** (`src/modules/websocket/`): Real-time communication via Socket.IO
- **HealthModule** (`src/modules/health/`): Health checks and monitoring
- **AuditModule** (`src/modules/audit/`): Activity logging and auditing
- **TutorialsModule** (`src/modules/tutorials/`): Tutorial management

API endpoints are prefixed with `/api/v1` and the server runs on port 8000 by default.

### Frontend Architecture (Next.js)

The frontend uses Next.js 15 App Router with these main routes:

- `/` - Landing page
- `/dashboard` - Main dashboard
- `/analysis` - Trading analysis interface
- `/charts` - Chart visualization (using ApexCharts and Lightweight Charts)
- `/chat` - AI chat interface
- `/portfolio` - Portfolio management
- `/trading` - Trading interface
- `/settings` - User settings

Key integrations:
- **Clerk**: Authentication and user management
- **Supabase**: Backend as a service (optional)
- **TipTap**: Rich text editor for notes
- **Tailwind CSS v4**: Styling with new Oxide engine

## Environment Configuration

Create `.env` files in both root and backend directories:

### Root `.env`
```bash
GEMINI_API_KEY=your_gemini_api_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Backend `.env`
```bash
NODE_ENV=development
PORT=8000
DB_TYPE=sqlite
DB_PATH=./data/trader-ai.sqlite
CORS_ORIGINS=http://localhost:3000
ALPHA_VANTAGE_API_KEY=demo
```

## Database

The backend uses TypeORM with SQLite by default. The database file is stored at `backend/data/trader-ai.sqlite`.

To switch to PostgreSQL:
1. Update `backend/.env` with PostgreSQL credentials
2. Set `DB_TYPE=postgres` and configure connection parameters

## API Communication

- Backend API: `http://localhost:8000/api/v1`
- WebSocket: Backend provides Socket.IO on the same port
- CORS is configured to accept requests from the frontend (port 3000)

## Key Dependencies

### Backend
- NestJS v10.4.4 with Express
- TypeORM v0.3.20 for database ORM
- Socket.IO v4.8.1 for WebSockets
- Alpha Vantage for market data
- Class Validator/Transformer for DTOs

### Frontend
- Next.js v15.5.3 with React v19.1.0
- Clerk for authentication
- Lightweight Charts v4.2.0 for financial charts
- ApexCharts v5.3.5 for general charts
- TipTap v3.5.1 for rich text editing
- Tailwind CSS v4 with PostCSS

## Development Tips

1. **Package Management**: Always use `pnpm` commands, not npm or yarn
2. **Module Imports**: Use workspace protocol for cross-package dependencies
3. **API Calls**: Frontend should call backend at `http://localhost:8000/api/v1`
4. **WebSocket**: Connect to `ws://localhost:8000` for real-time features
5. **Database**: SQLite database is created automatically on first run
6. **TypeScript**: Both frontend and backend use strict TypeScript configurations

## Common Development Tasks

### Adding a new API endpoint
1. Create controller, service, and module files in `backend/src/modules/[module-name]/`
2. Import the module in `backend/src/app.module.ts`
3. Define DTOs with class-validator decorators
4. Endpoints automatically get `/api/v1` prefix

### Adding a new frontend page
1. Create a new directory under `frontend/app/[page-name]/`
2. Add `page.tsx` for the page component
3. Optionally add `layout.tsx` for nested layouts
4. Use `route.ts` for API route handlers

### Running a single backend test
```bash
pnpm --filter backend test -- path/to/test.spec.ts
```

### Debugging
- Frontend: Use Chrome DevTools with Next.js debug mode
- Backend: NestJS runs with `--watch` flag in development for hot reload
- Check `backend/dist/` for compiled output if build issues occur