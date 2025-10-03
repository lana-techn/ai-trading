# Trader AI Backend (NestJS)

This document captures the refactor from the FastAPI implementation to the new NestJS backend. It outlines the project layout, major modules, available scripts, and areas that still require follow-up work for complete feature parity.

## Project Structure

```
backend/
├── README.md
├── package.json
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── eslint.config.js
├── .prettierrc
├── .env.example
├── data/
│   └── trader-ai.sqlite (created on first run when using SQLite)
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── app.controller.ts
    ├── app.service.ts
    ├── config/
    │   └── configuration.ts
    ├── database/
    │   └── database.module.ts
    └── modules/
        ├── analysis/
        │   ├── analysis.controller.ts
        │   ├── analysis.module.ts
        │   ├── analysis.service.ts
        │   └── dto/analysis-request.dto.ts
        ├── chat/
        │   ├── chat.controller.ts
        │   ├── chat.module.ts
        │   └── chat.service.ts
        ├── health/
        │   ├── health.controller.ts
        │   ├── health.module.ts
        │   └── health.service.ts
        ├── market-data/
        │   ├── market-data.controller.ts
        │   ├── market-data.module.ts
        │   └── market-data.service.ts
        ├── tutorials/
        │   ├── tutorials.controller.ts
        │   ├── tutorials.module.ts
        │   ├── tutorials.service.ts
        │   └── entities/
        │       ├── tutorial.entity.ts
        │       ├── tutorial-section.entity.ts
        │       ├── tutorial-tag.entity.ts
        │       └── tutorial-analytics.entity.ts
        ├── audit/
        │   ├── audit.module.ts
        │   ├── audit.service.ts
        │   └── entities/ai-decision.entity.ts
        └── websocket/
            ├── websocket.gateway.ts
            └── websocket.module.ts
```

## Key Modules

- **AnalysisModule** – Provides `/api/v1/analyze` endpoint. Generates technical indicators and trading recommendations using synthetic or Alpha Vantage data.
- **MarketDataModule** – Implements market data and price lookup endpoints, including a synthetic fallback when external requests fail.
- **ChatModule** – Supplies conversational and image analysis endpoints with in-memory session storage plus real-time market summaries.
- **HealthModule** – Exposes `/api/v1/health` diagnostic endpoint mirroring the FastAPI health check behaviour.
- **WebsocketModule** – Hosts a Socket.IO gateway at `/ws` for streaming price updates to subscribed clients.
- **TutorialsModule** – Replaces the Supabase-powered tutorial service with TypeORM entities and endpoints for tutorials, sections, tags, search, and analytics.
- **AuditModule** – Stores AI decision audit logs in the database and provides utilities for later compliance reviews.
- **DatabaseModule** – Centralises TypeORM configuration, supporting SQLite (default) or PostgreSQL via environment settings.
- **Scheduled Tasks** – The tutorials module schedules nightly analytics maintenance using `@nestjs/schedule`.

## Configuration

Environment variables now load via `@nestjs/config`. Update `.env` (copy from `.env.example`) with:

```
APP_NAME=Trader AI Backend
APP_VERSION=1.0.0
NODE_ENV=development
PORT=8000
CORS_ORIGINS=http://localhost:3000

# SQLite (default)
DB_TYPE=sqlite
DB_PATH=./data/trader-ai.sqlite

# PostgreSQL alternative
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=changeme
# DB_NAME=trader_ai
# DATABASE_URL=postgresql://user:password@localhost:5432/trader_ai

CORS_ORIGINS=http://localhost:3000
ALPHA_VANTAGE_API_KEY=your-key
CHAT_MEMORY_LIMIT=20
```

## Scripts

Execute from the workspace root (`pnpm run <script>`):

| Script | Description |
| --- | --- |
| `backend:start:dev` | Start NestJS in watch mode (used by `dev.sh`). |
| `backend:build` | Compile TypeScript sources to `dist/`. |
| `backend:start` | Run compiled server from `dist/`. |
| `backend:test` | Placeholder Jest runner (no specs yet). |
| `backend:lint` | Check lint rules via ESLint flat config. |

## Behavioural Changes

- All FastAPI code and Python dependencies have been removed; the backend is now fully TypeScript-based.
- Persistence now relies on TypeORM with auto-loaded entities. SQLite is used out of the box, while PostgreSQL can be enabled through environment variables.
- Configuration, middleware, and CORS logic leverage NestJS providers and lifecycle hooks instead of FastAPI lifespan handlers.
- AI and market-data services remain deterministic/synthetic until upstream model integrations are restored.
- Tutorial content, tags, and analytics are managed locally instead of Supabase but keep the same REST surface area.
- WebSocket handling is performed with Socket.IO rather than FastAPI websockets, and recurring analytics jobs run through NestJS scheduling.

## Outstanding Parity Tasks

1. Restore full AI provider integrations (Gemini, Qwen, Supabase image workflows) once credentials and SDKs are available.
2. Add Redis-backed caching for market data and tutorial analytics if needed.
3. Rebuild automated tests to cover module logic and service integrations.
4. Review security (authentication, rate limiting) before production deployment.

## Migration Checklist

- [x] Replace FastAPI app with NestJS project scaffolding.
- [x] Port core REST, chat, and websocket endpoints.
- [x] Update root scripts (`dev.sh`, `package.json`) to run NestJS backend.
- [x] Provide environment variable placeholders compatible with the new stack.
- [x] Restore data persistence (TypeORM + SQLite/PostgreSQL) and migrate tutorial data models.
- [x] Port critical background services (analytics maintenance, AI decision audit logging).
- [ ] Reconnect advanced AI pipelines (Gemini/Qwen/Supabase image workflows).
- [ ] Add comprehensive test coverage for new services.

Use `pnpm run backend:start:dev` (or `./dev.sh`) to boot the refactored backend alongside the existing Next.js frontend.
