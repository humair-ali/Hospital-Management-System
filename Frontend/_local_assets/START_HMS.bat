@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"

echo ==========================================
echo        HMS Hospital System (MySQL)
echo ==========================================
echo.

echo Starting backend (Express + MySQL)...
start "HMS Backend" cmd /c "set PATH=%PATH%;C:\Program Files\nodejs && cd Backend && npm start"

echo Starting frontend (Next.js)...
start "HMS Frontend" cmd /c "set PATH=%PATH%;C:\Program Files\nodejs && cd Frontend && npm run dev"

echo.
echo    Project is starting!
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo.
echo Please wait a few seconds for the servers to warm up.
pause
