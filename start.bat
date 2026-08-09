@echo off
title Smart E-Commerce Platform Launcher
echo ===================================================
echo       Starting Smart E-Commerce Platform           
echo ===================================================

rem 1. Ensure backend virtual environment exists
if not exist "%~dp0backend\.venv" (
    echo [setup] Creating backend virtual environment...
    python -m venv "%~dp0backend\.venv"
)

rem 2. Ensure frontend dependencies are installed
if not exist "%~dp0frontend\node_modules" (
    echo [frontend] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
)

echo.
echo ===================================================
echo  Launching Backend API: http://localhost:8000
echo  Launching Frontend:    http://localhost:3000
echo ===================================================
echo.

rem Launch Backend API in a separate window
start "Smart E-Commerce Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && "%~dp0backend\.venv\Scripts\python" -m uvicorn app.main:app --reload --port 8000"

rem Launch Frontend in the primary window
cd /d "%~dp0frontend"
npm run dev
pause
