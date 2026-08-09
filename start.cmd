@echo off
setlocal EnableExtensions

cd /d "%~dp0"

if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Backend dependencies were not found.
    echo Run install.cmd from the repository root first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules\next\dist\bin\next" (
    echo [ERROR] Frontend dependencies were not found.
    echo Run install.cmd from the repository root first.
    pause
    exit /b 1
)

netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul
if not errorlevel 1 (
    echo AI Learning Platform is already running at http://127.0.0.1:3000/
    start "" "http://127.0.0.1:3000/"
    endlocal
    exit /b 0
)

echo ================================================
echo   AI Learning Platform
echo ================================================
echo Starting backend and frontend...

if exist "frontend\.next" (
    echo Refreshing temporary Next.js cache...
    rmdir /S /Q "frontend\.next"
)

start "AI Learning Platform - Backend" /D "%~dp0backend" cmd.exe /k ".venv\Scripts\python.exe -m uvicorn app.main:app --reload"
start "AI Learning Platform - Frontend" /D "%~dp0frontend" cmd.exe /k "npm.cmd run dev -- --port 3000"

echo.
echo The application will open at http://127.0.0.1:3000/
echo Keep the two opened terminal windows running while you use the application.
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:3000/"

endlocal
