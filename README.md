# 🤖 AI Trading Agent

Platform analisis trading bertenaga AI dengan Next.js frontend dan NestJS backend.

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd trader-ai-agent

# 2. Install dependencies
pnpm install

# 3. Jalankan development server
pnpm dev
```

**Selesai!** Buka:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## 🌿 Branch Structure & Workflow

### Branch Hierarchy

```
main (production)
 └── development (staging)
     ├── backend-dev (backend development)
     └── frontend-dev (frontend development)
```

### Development Workflow

1. **Feature Development**:
   ```bash
   # Backend development
   git checkout backend-dev
   git pull origin backend-dev
   # ... develop backend features ...
   git add .
   git commit -m "feat: add new feature"
   git push origin backend-dev
   
   # Frontend development
   git checkout frontend-dev
   git pull origin frontend-dev
   # ... develop frontend features ...
   git add .
   git commit -m "feat: add new feature"
   git push origin frontend-dev
   ```

2. **Integration Testing**:
   ```bash
   # Merge ke development untuk testing
   git checkout development
   git pull origin development
   git merge backend-dev
   git merge frontend-dev
   git push origin development
   ```

3. **Production Release**:
   ```bash
   # Setelah testing di development berhasil
   git checkout main
   git pull origin main
   git merge development
   git push origin main
   ```

### Branch Guidelines

- **`backend-dev`**: Untuk semua development backend (NestJS, API, database)
- **`frontend-dev`**: Untuk semua development frontend (Next.js, React, UI)
- **`development`**: Staging branch untuk integrasi dan testing
- **`main`**: Production-ready code, hanya merge dari development

## 📋 Commands

| Command | Fungsi |
|---------|--------|
| `pnpm dev` | Jalankan frontend + backend |
| `pnpm dev:frontend` | Hanya frontend |
| `pnpm dev:backend` | Hanya backend |
| `pnpm build` | Build untuk production |
| `pnpm clean` | Bersihkan cache |
| `pnpm test` | Run tests |

## 🏗️ Struktur Project

```
trader-ai-agent/
├── frontend/           # Next.js 15 + React 19
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities & configs
│   │   └── styles/     # CSS & styling
│   └── package.json
├── backend/            # NestJS + TypeScript
│   ├── src/
│   │   ├── modules/    # Feature modules
│   │   ├── config/     # Configuration
│   │   └── common/     # Shared utilities
│   └── package.json
├── database/           # Database scripts & configs
├── package.json        # Workspace root
└── README.md          # Project documentation
```

## 🎯 Features

- ✅ **Real-time Market Analysis**: Live market data processing
- ✅ **AI-Powered Trading Insights**: Machine learning algorithms for market prediction
- ✅ **Interactive Charts**: Advanced charting with technical indicators
- ✅ **Chat Interface with AI**: Natural language queries for market analysis
- ✅ **Portfolio Tracking**: Real-time portfolio performance monitoring
- ✅ **User Authentication**: Secure user management with Clerk
- ✅ **WebSocket Support**: Real-time data streaming

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL (for database)

### Environment Variables

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Configure your environment variables:
   - Database connection
   - API keys
   - Authentication settings

### Database Setup

```bash
# Setup database
cd backend
pnpm run db:migrate
pnpm run db:seed
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific parts
pnpm test:frontend
pnpm test:backend

# Run with coverage
pnpm test:coverage
```

## 🚀 Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch from appropriate dev branch:
   - Backend: `git checkout -b feature/backend-feature backend-dev`
   - Frontend: `git checkout -b feature/frontend-feature frontend-dev`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request to the appropriate dev branch

### Commit Convention

We use conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation
- `style:` formatting, missing semi colons, etc
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance

## 📝 License

This project is licensed under the MIT License.

---

**Happy trading!** 📈✨
