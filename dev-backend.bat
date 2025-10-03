@echo off
REM AI Trading Agent - Backend Only (Windows)

echo 🔧 AI Trading Agent - Backend Only (Windows)
echo ==============================================

echo.
echo ✅ Starting backend server...
echo Backend: http://localhost:8000
echo Press Ctrl+C to stop
echo.

cd backend
pnpm start:dev
cd ..