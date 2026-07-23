@echo off
setlocal

cd /d "%~dp0backend"

if exist ".venv\Scripts\python.exe" (
    echo Starting AI Learning Platform backend with local virtual environment...
    ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload
) else (
    echo Local virtual environment not found.
    echo Run install.cmd from the repository root first.
    pause
    exit /b 1
)

if errorlevel 1 (
    echo.
    echo Backend failed to start.
    echo Check the error above or run install.cmd again.
    pause
)

endlocal
