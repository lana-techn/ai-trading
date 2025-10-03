# AI Trading Agent - Simple Development Script for Windows
# PowerShell script to run both frontend and backend

Write-Host "🚀 AI Trading Agent - Simple Development Mode (Windows)" -ForegroundColor Blue
Write-Host "=========================================================" -ForegroundColor Blue

# Function to cleanup processes on exit
function Cleanup {
    Write-Host "`n🔄 Shutting down servers..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*next dev*" -or $_.CommandLine -like "*nest start*"} | Stop-Process -Force
    Write-Host "✅ Development environment stopped" -ForegroundColor Green
    exit
}

# Register cleanup function for Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

Write-Host "`n✅ Starting servers..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all servers`n" -ForegroundColor Yellow

# Start backend in background
Write-Host "🔧 Starting backend..." -ForegroundColor Blue
Set-Location backend
Start-Process powershell -ArgumentList "-Command", "pnpm start:dev" -NoNewWindow
Set-Location ..

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend in foreground
Write-Host "🎨 Starting frontend..." -ForegroundColor Blue
Set-Location frontend
try {
    & pnpm dev
} finally {
    Set-Location ..
    Cleanup
}