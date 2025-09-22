# 🤖 Warp AI Assistant Guide

> **Comprehensive documentation for AI-powered project management and development assistance**

## 📋 Overview

This document serves as a complete guide for using the Warp AI assistant to manage and develop the AI Trading Agent project. It includes best practices, common commands, troubleshooting procedures, and development workflows optimized for AI-assisted coding.

---

## 🚀 Quick Start Commands

### **Development Workflow**

```bash
# Start development environment
./dev.sh                     # Full development stack
./dev.sh frontend           # Frontend only (Next.js on :3000)
./dev.sh backend            # Backend only (FastAPI on :8000)

# Using pnpm shortcuts
pnpm dev                    # Start both servers
pnpm frontend              # Frontend only
pnpm backend               # Backend only

# Check status and stop
./dev.sh status            # Check server status
./dev.sh stop              # Stop all servers
./dev.sh clean             # Clean and restart fresh
```

### **Project Management**

```bash
# Test setup integrity
./scripts/test_setup.sh    # Comprehensive setup verification

# Package management
pnpm install:all           # Install all dependencies
pnpm frontend:install      # Frontend deps only
pnpm backend:install       # Backend deps only

# Build and deployment
pnpm build                 # Production build
pnpm lint                  # Code linting
pnpm test                  # Run tests
```

---

## 🏗️ Project Structure

### **Current Optimized Structure**

```
ai-trading-agent/
├── 📁 backend/              # FastAPI backend
│   ├── 📁 app/             # Main application
│   │   ├── 📁 core/        # Core configurations
│   │   ├── 📁 models/      # Data models
│   │   ├── 📁 services/    # Business logic services
│   │   └── 📁 utils/       # Utility functions
│   ├── minimal_server.py   # Development server
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables
│   └── .env.example        # Environment template
├── 📁 frontend/            # Next.js frontend
│   ├── 📁 app/            # Next.js 15 app directory
│   ├── 📁 components/     # React components
│   │   ├── 📁 analysis/   # Analysis components
│   │   ├── 📁 charts/     # Trading charts (optimized)
│   │   ├── 📁 chat/       # AI chat interface
│   │   ├── 📁 layout/     # Layout components
│   │   ├── 📁 providers/  # Context providers
│   │   ├── 📁 trading/    # Trading-specific UI
│   │   └── 📁 ui/         # Base UI components
│   ├── 📁 lib/            # Utilities and API
│   ├── 📁 public/         # Static assets
│   ├── package.json       # Node dependencies
│   └── pnpm-lock.yaml     # pnpm lockfile
├── 📁 docs/               # Documentation
│   ├── SETUP_GUIDE.md     # Detailed setup guide
│   └── QUICKSTART.md      # Quick start guide
├── 📁 scripts/            # Utility scripts
│   ├── start_backend.sh   # Legacy backend starter
│   ├── start_frontend.sh  # Legacy frontend starter
│   ├── start_dev.sh       # Legacy dev starter
│   └── test_setup.sh      # Setup verification
├── dev.sh                 # 🌟 Main development script
├── package.json           # Root package.json (workspace)
├── pnpm-workspace.yaml    # pnpm workspace config
├── README.md              # Main documentation
├── Warp.md               # 🤖 This AI assistant guide
└── .gitignore            # Git ignore rules
```

### **Key Components Removed**

```
❌ Removed redundant chart components:
   - AdvancedTradingChart.tsx
   - AlternativeChart.tsx
   - BackupWorkingChart.tsx
   - BasicCandlestickChart.tsx
   - DebugCandlestickChart.tsx
   - DebugTestChart.tsx
   - FinalCandlestickChart.tsx
   - GuaranteedChart.tsx
   - SimpleTradingChart.tsx
   - TradingChart.tsx
   - UltimateTestChart.tsx
   - WorkingTradingChart.tsx

❌ Removed debug/temporary files:
   - frontend/.next/ (build cache)
   - backend/logs/*.log
   - backend/*.pid
   - CANDLESTICK_DEBUG.md
   - REALTIME_CHARTS.md
   - scripts/dev.sh (old version)

❌ Consolidated scripts:
   - start_servers.sh
   - test_chat.sh
```

---

## 🛠️ AI Assistant Workflows

### **1. Development Session Start**

```bash
# Standard development session initialization
./dev.sh status              # Check current status
./dev.sh clean              # Clean start (if needed)
./dev.sh                    # Start development environment

# Verify everything is running
curl http://localhost:8000/health
curl http://localhost:3000
```

### **2. Making Changes**

**Frontend Changes:**
```bash
# Frontend hot-reload is automatic
# Changes in frontend/ trigger automatic recompilation
# Check browser console for any errors
```

**Backend Changes:**
```bash
# Backend auto-reloads with FastAPI + uvicorn
# Check terminal output for reload confirmations
# Test API endpoints after changes
```

### **3. Adding New Features**

**New Chart Component:**
```bash
# Only keep necessary chart components
# Current active: ProfessionalTradingChart.tsx, TradingSidebar.tsx, ChartBottomSections.tsx
# Add new components to frontend/components/charts/
# Update imports in app/charts/page.tsx
```

**New API Endpoint:**
```bash
# Add to backend/app/services/ or backend/app/main.py
# Update frontend/lib/api.ts with new endpoints
# Test with curl or frontend integration
```

### **4. Dependency Management**

```bash
# Frontend dependencies
cd frontend && pnpm add package-name
cd frontend && pnpm add -D package-name    # Dev dependency

# Backend dependencies
cd backend && source venv/bin/activate
cd backend && pip install package-name
cd backend && pip freeze > requirements.txt

# Update lockfiles
pnpm install                               # Update pnpm-lock.yaml
```

---

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Port Already in Use**
```bash
# Check what's using ports
lsof -i :3000
lsof -i :8000

# Kill processes (dev.sh does this automatically)
./dev.sh stop
./dev.sh clean
```

#### **Dependencies Missing**
```bash
# Full dependency reinstall
./dev.sh clean
pnpm install:all

# Individual service
cd frontend && pnpm install
cd backend && pip install -r requirements.txt
```

#### **Build Errors**
```bash
# Clear all caches
rm -rf frontend/.next
rm -rf frontend/node_modules
cd frontend && pnpm install

# Backend cache clear
find backend -name "__pycache__" -type d -exec rm -rf {} +
find backend -name "*.pyc" -delete
```

#### **Environment Variables**
```bash
# Check environment files exist
ls -la backend/.env
ls -la frontend/.env.local

# Copy from examples if missing
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### **AI Chat Not Working**
```bash
# Verify Gemini API key
grep GEMINI_API_KEY backend/.env

# Check backend logs
./dev.sh backend
# Look for Gemini connection errors

# Test chat endpoint directly
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'
```

---

## 📊 Performance Optimization

### **Frontend Performance**

```bash
# Production build analysis
cd frontend && pnpm build

# Bundle analysis
cd frontend && pnpm add -D @next/bundle-analyzer
# Add to next.config.ts for bundle analysis

# Image optimization (already configured)
# Next.js Image component optimizes automatically
```

### **Backend Performance**

```bash
# Profile API performance
# Add timing middleware to FastAPI
# Monitor with uvicorn --log-level debug

# Database query optimization
# Use database query logging
# Optimize with indexes and query analysis
```

### **Development Speed**

```bash
# Use pnpm for faster installs (already implemented)
# Keep dev servers running during development
# Use hot reload for immediate feedback
# Utilize TypeScript for better development experience
```

---

## 🧪 Testing Strategies

### **Automated Testing**

```bash
# Frontend testing
cd frontend && pnpm test

# Backend testing (when implemented)
cd backend && python -m pytest

# Integration testing
./scripts/test_setup.sh     # Current setup verification
```

### **Manual Testing Checklist**

**Frontend:**
- [ ] All pages load correctly
- [ ] Theme switching works (light/dark)
- [ ] Chat interface responds
- [ ] Charts display properly
- [ ] Navigation functions

**Backend:**
- [ ] `/health` endpoint responds
- [ ] Chat API returns responses
- [ ] CORS headers allow frontend access
- [ ] Environment variables loaded
- [ ] Gemini API integration works

**Integration:**
- [ ] Frontend can communicate with backend
- [ ] Chat messages flow end-to-end
- [ ] Error handling displays properly
- [ ] Performance is acceptable

---

## 🔐 Security Considerations

### **API Keys & Secrets**

```bash
# Never commit API keys
# Use .env files (already in .gitignore)
# Rotate keys regularly
# Use environment variables in production

# Check for accidentally committed secrets
git log --all -p | grep -i "api_key\|secret\|password"
```

### **CORS Configuration**

```bash
# Backend CORS is configured for development
# Update for production domains
# Review backend/app/core/config.py
```

---

## 📝 AI Assistant Best Practices

### **When Working with Warp AI**

1. **Always specify context:**
   ```bash
   # Good: "Update the ProfessionalTradingChart component to add RSI indicator"
   # Bad: "Update the chart"
   ```

2. **Include relevant file paths:**
   ```bash
   # Good: "The issue is in frontend/components/chat/AIChat.tsx line 45"
   # Bad: "The chat component has an error"
   ```

3. **Provide error messages:**
   ```bash
   # Copy full error output
   # Include stack traces
   # Mention which browser/environment
   ```

4. **Test incrementally:**
   ```bash
   # Make small changes
   # Test each change
   # Commit frequently with clear messages
   ```

### **Code Organization Tips**

- **Keep components focused:** Single responsibility principle
- **Use TypeScript:** Leverage type safety
- **Follow naming conventions:** Consistent file and component names
- **Document complex logic:** Add comments for AI context
- **Maintain clean imports:** Use absolute imports where configured

---

## 🔄 Deployment Preparation

### **Production Build**

```bash
# Frontend production build
cd frontend && pnpm build

# Test production build locally
cd frontend && pnpm start

# Backend production setup
cd backend && pip install gunicorn
cd backend && gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### **Environment Configuration**

```bash
# Production environment variables
# Update backend/.env for production
# Set NODE_ENV=production for frontend
# Configure database connections
# Set up monitoring and logging
```

---

## 📞 Support & Maintenance

### **Regular Maintenance Tasks**

```bash
# Weekly:
pnpm update                 # Update dependencies
./scripts/test_setup.sh     # Verify setup integrity
./dev.sh clean              # Clean rebuild

# Monthly:
# Review and update dependencies
# Check for security vulnerabilities
# Performance monitoring
# Backup configurations
```

### **Getting Help**

1. **Check this document first**
2. **Review error logs in terminal**
3. **Test with minimal reproduction**
4. **Provide specific error messages to AI assistant**
5. **Include relevant code snippets**

---

## 📈 Future Enhancements

### **Planned Features**
- [ ] Real-time market data integration
- [ ] Advanced technical analysis
- [ ] Portfolio tracking
- [ ] Automated testing suite
- [ ] Production deployment scripts
- [ ] Database migrations
- [ ] User authentication
- [ ] WebSocket real-time updates

### **Performance Improvements**
- [ ] Bundle size optimization
- [ ] Database query optimization  
- [ ] Caching strategies
- [ ] CDN integration
- [ ] Server-side rendering optimization

---

**📝 Document Version:** 1.0  
**📅 Last Updated:** December 2024  
**🤖 AI Assistant:** Warp AI (Claude 4 Sonnet)  
**📊 Project Status:** Active Development

---

> **💡 Pro Tip:** Keep this document updated as the project evolves. The AI assistant can help maintain this documentation by suggesting updates based on project changes.