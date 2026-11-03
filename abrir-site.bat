@echo off
chcp 65001 >nul
title BioMake - site
cd /d "%~dp0"
echo Abrindo o site da BioMake em http://localhost:3000
start "" http://localhost:3000
node tools\serve-local.js
pause
