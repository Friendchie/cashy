@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
echo ======================================================
echo 🏦 Iniciando Cashy AI (Banca en Linea - Asesor QVAC)
echo ======================================================

echo Iniciando el Servidor de Inteligencia Artificial (QVAC OpenAI-compatible) en el puerto 11434...
start /B npx.cmd @qvac/cli serve --openai -p 11434

echo Esperando a que el motor AI inicie (5 segundos)...
ping 127.0.0.1 -n 6 > nul

echo Iniciando la Aplicacion Web de Caja de Ahorros...
node server/index.js
