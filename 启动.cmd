@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 需要安装 Node.js 才能使用启动器。也可以直接打开 index.html。
  pause
  exit /b 1
)
node server.cjs --open
if errorlevel 1 pause
