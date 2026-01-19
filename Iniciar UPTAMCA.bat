@echo off
echo Iniciando Proyecto UPTAMCA...

:: Iniciar el Cliente
start cmd /k "cd client && npm run dev"

:: Iniciar el Servidor
start cmd /k "cd server && npm run dev"

:: Esperar 5 segundos para que carguen los servicios
timeout /t 5 /nobreak

:: Abrir el navegador en la dirección de tu proyecto
:: Cambia el puerto (5173, 3000, etc.) según el que use tu cliente
start http://localhost:5173

echo Todo listo.