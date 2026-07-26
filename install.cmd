@echo off
setlocal EnableExtensions

cd /d "%~dp0"

echo ================================================
echo   AI Learning Platform - installation
echo ================================================
echo.

for /f "tokens=2" %%V in ('python --version 2^>^&1') do set "PYTHON_VERSION=%%V"
if not defined PYTHON_VERSION (
    echo [ERROR] Python was not found or could not be started.
    echo Install Python 3.12 or newer from https://www.python.org/downloads/
    echo During installation, enable "Add Python to PATH", then run this file again.
    pause
    exit /b 1
)
for /f "tokens=1,2 delims=." %%A in ("%PYTHON_VERSION%") do (
    set "PYTHON_MAJOR=%%A"
    set "PYTHON_MINOR=%%B"
)
if not defined PYTHON_MAJOR (
    echo [ERROR] Could not determine the Python version.
    pause
    exit /b 1
)
if %PYTHON_MAJOR% LSS 3 goto :python_too_old
if %PYTHON_MAJOR% EQU 3 if %PYTHON_MINOR% LSS 12 goto :python_too_old

echo [OK] Python %PYTHON_VERSION% found.
echo.

if not exist "backend\requirements.txt" (
    echo [ERROR] backend\requirements.txt was not found.
    echo Run this installer from the repository root.
    pause
    exit /b 1
)

if exist "backend\.venv\Scripts\python.exe" (
    backend\.venv\Scripts\python.exe --version >nul 2>&1
    if errorlevel 1 (
        echo [1/4] Existing virtual environment is stale; recreating it...
        rmdir /S /Q "backend\.venv"
        if errorlevel 1 goto :failed
    )
)

if not exist "backend\.venv\Scripts\python.exe" (
    echo [1/4] Creating backend virtual environment...
    python -m venv backend\.venv
    if errorlevel 1 goto :failed
) else (
    echo [1/4] Virtual environment already exists.
)

echo [2/4] Installing Python dependencies...
backend\.venv\Scripts\python.exe -m pip install --upgrade pip
if errorlevel 1 goto :failed
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 goto :failed

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js with npm was not found.
    echo Install current Node.js LTS from https://nodejs.org/ then run this file again.
    pause
    exit /b 1
)

echo [3/4] Installing Next.js frontend dependencies...
pushd frontend
call npm.cmd install
if errorlevel 1 (
    popd
    goto :failed
)
popd

if not exist ".env" (
    if exist ".env.example" (
        echo [4/4] Creating .env from .env.example...
        copy /Y ".env.example" ".env" >nul
    ) else (
        echo [4/4] .env.example not found; skipping .env creation.
    )
) else (
    echo [4/4] Existing .env preserved.
)

echo.
echo Installation completed successfully.
echo.
echo Start the backend with:     start_backend.cmd
echo Start the Next.js UI with:  start_frontend.cmd
echo Open in the browser:        http://127.0.0.1:3000/
echo.
echo Optional AI setup:
echo   Codex mode:  cmd.exe /d /s /c "codex.cmd login"
echo   API mode:    edit .env and set OPENAI_API_KEY
pause
exit /b 0

:python_too_old
echo [ERROR] Python %PYTHON_VERSION% is not supported. Python 3.12 or newer is required.
echo Install a current Python version from https://www.python.org/downloads/
pause
exit /b 1

:failed
echo.
echo [ERROR] Installation failed. Check the message above and run install.cmd again.
pause
exit /b 1
