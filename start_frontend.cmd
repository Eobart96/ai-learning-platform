@echo off
setlocal

cd /d "%~dp0frontend"

if not exist "node_modules\next\dist\bin\next" (
    echo Frontend dependencies were not found.
    echo Run install.cmd from the repository root first.
    pause
    exit /b 1
)

echo Starting AI Learning Platform frontend at http://127.0.0.1:3000/
call npm.cmd run dev

endlocal
