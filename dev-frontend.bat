@echo off
REM AI Trading Agent - Frontend Only (Windows)

echo 🎨 AI Trading Agent - Frontend Only (Windows)
echo ===============================================

echo.
echo ✅ Starting frontend server...
echo Frontend: http://localhost:3000
echo Press Ctrl+C to stop
echo.

cd frontend
pnpm dev
cd ..