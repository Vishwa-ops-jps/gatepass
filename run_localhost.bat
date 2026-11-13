@echo off
title GatePass Full-Stack Platform Runner
color 0B

echo ======================================================================
echo             GatePass Enterprise Full-Stack Platform Suite
echo ======================================================================
echo.
echo [1/3] Checking and launching SQLite + Express Backend (:5001)...
start "GatePass Backend & Web Portal" cmd /k "cd /d "%~dp0" && node server/index.js"

echo.
echo [2/3] Waiting 2 seconds for server initialization...
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Opening GatePass Platform in browser...
echo.
echo ======================================================================
echo   GATEPASS WEB PORTAL: http://localhost:5001
echo   PORTAL LOGINS:       Admin, Security Guard, Resident Owner
echo   API REST ENDPOINTS:  http://localhost:5001/api
echo   API DEV DASHBOARD:   http://localhost:5001/api-docs
echo   WEBSOCKET SERVER:    ws://localhost:5001/ws
echo   EXPO MOBILE DEV:     http://localhost:8081
echo ======================================================================
echo.

start "" "http://localhost:5001"
cd /d "%~dp0"
npx expo start --web