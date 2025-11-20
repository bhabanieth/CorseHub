@echo off
REM CourseShare - Quick Start Script
REM This script starts the application on Windows

echo.
echo ========================================
echo   CourseShare - Starting Application
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

REM Navigate to server directory
cd server

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the server
echo Starting CourseShare Server...
echo.
echo ========================================
echo   Server running on http://localhost:5000
echo ========================================
echo.
echo Opening browser... (please wait)
timeout /t 2

REM Try to open the browser
start http://localhost:5000

REM Start the server
call npm start

REM Keep the window open if there's an error
if errorlevel 1 (
    pause
)
