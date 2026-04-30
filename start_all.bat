@echo off
echo ==========================================
echo   Starting TravelSphere - All Services
echo ==========================================
echo.

echo [1/3] Starting Backend Server...
start "TravelSphere Backend" cmd /k "cd /d c:\Users\yash0\.gemini\antigravity\scratch\travel_app\backend && node server.js"

timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend Dev Server...
start "TravelSphere Frontend" cmd /k "cd /d c:\Users\yash0\.gemini\antigravity\scratch\travel_app\frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Public Tunnel...
start "TravelSphere Tunnel" cmd /k "npx -y localtunnel --port 5173"

echo.
echo ==========================================
echo   All services started!
echo   Check the "TravelSphere Tunnel" window
echo   for your public URL to share.
echo ==========================================
pause
