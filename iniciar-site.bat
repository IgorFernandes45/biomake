@echo off
chcp 65001 >nul
title BioMake - site
cd /d "%~dp0"
rem A senha da equipe fica em senha.txt (arquivo local, nao vai para o GitHub). Uma linha, so a senha.
if exist senha.txt set /p BIOMAKE_PIN=<senha.txt
echo Abrindo o site da BioMake em http://localhost:3000
start "" http://localhost:3000
node server.js
pause
