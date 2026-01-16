@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"

echo ==========================================
echo    HMS Hospital System (Ready to Use)
echo ==========================================
echo.
echo [1/3] Initializing Database (SQLite)...
cd Backend
node scripts/sqlite_init.js
cd ..

echo [2/3] Starting Backend (Port 5000)...
start "HMS Backend" cmd /c "cd Backend && node server.js"

echo [3/3] Starting Frontend (Port 3000)...
start "HMS Frontend" cmd /c "cd Frontend && node node_modules/next/dist/bin/next dev"

echo.
echo ==========================================
echo    SYSTEM IS LIVE!
echo    Frontend: http://localhost:3000
echo    Login: admin@hospital.com / admin123
echo ==========================================
pause
