@echo off
setlocal

cd /d "%~dp0backend"

if exist ".venv\Scripts\python.exe" (
    echo Starting AI Learning Platform backend with local virtual environment...
    ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload
) else (
    echo Local virtual environment not found. Using system Python...
    python -m uvicorn app.main:app --reload
)

if errorlevel 1 (
    echo.
    echo Backend failed to start.
    echo Install dependencies with:
    echo   python -m pip install -r requirements.txt
    pause
)

endlocal
