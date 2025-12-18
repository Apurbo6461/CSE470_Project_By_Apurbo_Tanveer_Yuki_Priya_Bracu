@echo off
echo Starting Lifelink Patient Management System...
echo.

REM Kill any existing node processes on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

timeout /t 1 /nobreak

REM Start backend in background
echo [1/2] Starting backend server on port 5000...
start "Backend - Lifelink" cmd /k "cd backend && npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend in background
echo [2/2] Starting frontend server on port 5173...
start "Frontend - Lifelink" cmd /k "cd frontend && npm run dev"

REM Wait for frontend to start
timeout /t 4 /nobreak

echo.
echo ========================================
echo Lifelink Patient Management is running!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo.
echo Close this window to stop the servers.
echo.

REM Open browser
timeout /t 2 /nobreak
start http://localhost:5173

:end
pause
