@echo off
echo Cleaning node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Installing dependencies...
call npm install

echo Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo Clean installation completed! 