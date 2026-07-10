@echo off
title Bee Coop E-commerce - Server Locale
cd /d "%~dp0"
echo.
echo ==============================================================
echo   AVVIO SERVER DI SVILUPPO PER BEE COOP E-COMMERCE
echo   Apertura automatica del browser su: http://localhost:3000
echo ==============================================================
echo.
start http://localhost:3000
npm run dev
pause
