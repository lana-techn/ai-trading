# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview

- Monorepo managed with pnpm workspaces: frontend (Next.js 15, React 19) and backend (NestJS 10, TypeORM). Root scripts orchestrate both services.
- Default ports: frontend http://localhost:3000, backend http://localhost:8000.
- Environment templates: .env.example (root), backend/.env.example, frontend/.env.local.example.

Common commands

- Install dependencies
```bash path=null start=null
pnpm install
```

- Run both services in dev mode
```bash path=null start=null
pnpm dev
```

- Run only one side in dev mode
```bash path=null start=null
pnpm dev:frontend
pnpm dev:backend
```

- Build for production and start
```bash path=null start=null
pnpm build
pnpm start
```

- Lint
```bash path=null start=null
# All packages
pnpm lint

# Per package
pnpm --filter frontend lint
pnpm --filter backend lint

# Optional: backend formatting
pnpm --filter backend format
```

- Tests (backend Jest)
```bash path=null start=null
# All backend tests
pnpm --filter backend test

# Watch mode
pnpm --filter backend test:watch

# Single test file
pnpm --filter backend test -- src/path/to/file.spec.ts

# Single test by name/pattern
pnpm --filter backend test -- -t "pattern"

# Coverage
pnpm --filter backend test:cov
```

- Performance analysis utilities
```bash path=null start=null
# Performance/build analysis (see scripts/analyze-performance.js)
pnpm analyze

# Frontend bundle analyzer
pnpm analyze:bundle

# Lighthouse (ensure frontend is running on :3000)
pnpm lighthouse

# Clean build caches
pnpm clean
```

- Integration smoke test (requires both servers running)
```bash path=null start=null
./test-chat.sh
```

High-level architecture

- Frontend (frontend/)
  - Next.js App Router
    - Routes include: /, /chat, /analysis, /dashboard, /portfolio, /trading, /charts, /settings, /tutorials, /debug.
    - app/layout.tsx wraps pages with ClerkProvider, ThemeProvider, and a shared LandingLayout.
  - Authentication and user context via @clerk/nextjs.
  - Data access
    - REST client in lib/api.ts (axios) points to ${NEXT_PUBLIC_API_URL:-http://localhost:8000}/api/v1.
    - Supabase client utilities in lib/supabase.ts and lib/supabase-db.ts for storage and RLS-backed data models (see database/schema.sql).
    - WebSocket helpers in lib/websocket.ts for real-time updates.
  - UI and performance
    - Tailwind CSS configured; dynamic imports and split-chunk policies.
    - middleware.ts sets security and cache headers and guards server action edge cases.
    - next.config.js enables optimizePackageImports, custom splitChunks, image optimization, compression, and HTTP headers.

- Backend (backend/)
  - NestJS app composition (src/app.module.ts)
    - Global ConfigModule loading src/config/configuration.ts.
    - ScheduleModule for cron/interval tasks.
    - DatabaseModule (TypeORM) auto-detects DB type and connection from env; sets synchronize: true; autoLoadEntities: true.
    - Feature modules imported: AiModule, AnalysisModule, MarketDataModule, ChatModule, TutorialsModule, AuditModule, HealthModule, WebsocketModule.
    - Global CacheInterceptor (APP_INTERCEPTOR) for tiered TTL caching.
  - Database (src/database/database.module.ts)
    - Chooses Postgres or SQLite based on DATABASE_URL/DB_TYPE; for SQLite ensures local path exists (default ./data/trader-ai.sqlite).
    - Postgres URL assembled from DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME when DATABASE_URL is not provided.
  - Configuration (src/config/configuration.ts)
    - Maps environment variables for app, database, CORS, market data, chat, and AI keys.
  - API
    - Frontend expects a REST API under /api/v1 (see frontend/lib/api.ts). Endpoints include health, analyze, market-data, price, symbols, chat (including image upload), and chat history.

- Data model and storage
  - TypeORM (backend) manages entities automatically (autoLoadEntities) with DB synchronize on.
  - Supabase schema (database/schema.sql) defines storage for image uploads, chat sessions/messages, watchlists, and portfolio holdings, with RLS policies enabled. If using Supabase, apply this schema to provision buckets, tables, and policies.

Environment and configuration

- Root .env.example includes keys for:
  - Gemini (GEMINI_API_KEY) and Alpha Vantage (ALPHA_VANTAGE_KEY) for AI and market data.
  - Supabase URL/keys for frontend and service interactions.
  - Server defaults (HOST, PORT=8000) and optional DATABASE_URL.
- Frontend uses NEXT_PUBLIC_* variables to reach the backend (NEXT_PUBLIC_API_URL default: http://localhost:8000).
- CORS defaults allow http://localhost:3000 (configurable via CORS_ORIGINS).

Performance profile (important parts)

- Frontend
  - Code splitting and dynamic imports, compression, image optimization (WebP/AVIF), long-term caching for static assets, no-store for API routes.
  - Bundle analysis via ANALYZE=true builds and pnpm analyze:bundle.
- Backend
  - Global compression and security headers (helmet), cache interceptor with per-route TTL strategies, graceful shutdown.
- Useful scripts: pnpm analyze, pnpm build:prod, pnpm lighthouse, pnpm clean.

Notes and quirks for this repo

- README Quick Start and workspace scripts are generally accurate. However:
  - The README mentions db:migrate/db:seed scripts; these are not defined in backend/package.json. Database schema is managed by TypeORM synchronize for the Nest app; Supabase objects are defined in database/schema.sql.
  - The root package.json description references a “FastAPI backend”; the actual backend is NestJS.
- Frontend axios client (lib/api.ts) assumes backend base URL is ${NEXT_PUBLIC_API_URL:-http://localhost:8000} with versioned prefix /api/v1.

Version control workflow (from README highlights)

- Branches: main (prod), development (staging), backend-dev, frontend-dev. Merge backend-dev and frontend-dev into development for integration; then to main for releases.
