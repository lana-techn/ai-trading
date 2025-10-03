@echo off
REM AI Trading Agent - Simple Development Script for Windows
REM Batch script to run both frontend and backend

echo 🚀 AI Trading Agent - Simple Development Mode (Windows)
echo =========================================================

echo.
echo ✅ Starting servers...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo Press Ctrl+C to stop all servers
echo.

REM Start backend in background
echo 🔧 Starting backend...
cd backend
start /b pnpm start:dev > ..\backend.log 2>&1
cd ..

REM Wait a bit for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend in foreground
echo 🎨 Starting frontend...
cd frontend
pnpm dev

REM Cleanup will happen when user presses Ctrl+C
echo.
echo ✅ Development environment stopped
cd ..