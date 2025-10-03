# 🪟 Windows Setup Guide - AI Trading Agent

Panduan khusus untuk menjalankan AI Trading Agent di Windows.

## 📋 Prerequisites

1. **Node.js 18+** - Download dari [nodejs.org](https://nodejs.org)
2. **Git** - Download dari [git-scm.com](https://git-scm.com)
3. **pnpm** - Install setelah Node.js:
   ```cmd
   npm install -g pnpm
   ```

## 🚀 Quick Start

### 1. Clone Repository
```cmd
git clone https://github.com/your-repo/ai-trading-agent.git
cd ai-trading-agent
```

### 2. Install Dependencies
```cmd
pnpm setup
```

### 3. Start Development Servers

**Option A - Both servers (Recommended):**
```cmd
dev-simple.bat
```

**Option B - Individual servers:**
```cmd
dev-frontend.bat    # Frontend only (port 3000)
dev-backend.bat     # Backend only (port 8000)
```

**Option C - PowerShell (Advanced):**
```powershell
.\dev-simple.ps1
```

## 🔧 Common Issues & Solutions

### Issue 1: "Execution Policy" Error

**Problem:** PowerShell blocks `.ps1` scripts
```
cannot be loaded because running scripts is disabled on this system
```

**Solution:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Or for current user only:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 2: "Command not found" Errors

**Problem:** `node`, `pnpm`, or `git` not recognized

**Solution:**
1. Reinstall Node.js with "Add to PATH" option checked
2. Restart Command Prompt/PowerShell
3. Verify installation:
   ```cmd
   node --version
   pnpm --version
   ```

### Issue 3: Port Already in Use

**Problem:** 
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```cmd
# Find process using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID_NUMBER> /F
```

### Issue 4: SQLite Installation Issues

**Problem:** Native module compilation fails

**Solution:**
```cmd
# Install Windows build tools
npm install -g windows-build-tools

# Or use Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

# Then reinstall
pnpm setup
```

### Issue 5: Network/Firewall Issues

**Problem:** Cannot access http://localhost:3000

**Solution:**
1. Check Windows Firewall settings
2. Allow Node.js through firewall
3. Try accessing via IP: http://127.0.0.1:3000

## 📁 File Structure for Windows

```
ai-trading-agent/
├── dev-simple.bat        # 🌟 Main development script
├── dev-simple.ps1        # PowerShell alternative  
├── dev-frontend.bat      # Frontend only
├── dev-backend.bat       # Backend only
├── backend/              # NestJS backend
└── frontend/            # Next.js frontend
```

## 🎯 Development Workflow

1. **Start development:**
   ```cmd
   dev-simple.bat
   ```

2. **Access applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/v1/health

3. **Stop servers:**
   - Press `Ctrl+C` in the terminal

4. **Restart after changes:**
   - Both servers auto-reload on file changes
   - If issues, stop and restart scripts

## 🐛 Advanced Troubleshooting

### Check Running Processes
```cmd
# List all Node.js processes
tasklist /FI "IMAGENAME eq node.exe"

# Kill all Node.js processes (nuclear option)
taskkill /IM node.exe /F
```

### Clean Dependencies
```cmd
# Remove all node_modules and reinstall
rmdir /s /q node_modules
rmdir /s /q frontend\node_modules  
rmdir /s /q backend\node_modules
del pnpm-lock.yaml

pnpm setup
```

### Environment Variables
Create `.env` files if needed:

**backend/.env:**
```env
NODE_ENV=development
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

## 🆘 Still Having Issues?

1. **Check logs:**
   - `backend.log` - Backend server logs
   - `frontend.log` - Frontend server logs (if exists)

2. **Verify Node.js version:**
   ```cmd
   node --version
   # Should be v18+ or v20+
   ```

3. **Try manual startup:**
   ```cmd
   # Terminal 1 - Backend
   cd backend
   pnpm start:dev
   
   # Terminal 2 - Frontend  
   cd frontend
   pnpm dev
   ```

4. **Contact support** with:
   - Windows version
   - Node.js version
   - Error messages
   - Log files

---

**Happy coding on Windows! 🚀**