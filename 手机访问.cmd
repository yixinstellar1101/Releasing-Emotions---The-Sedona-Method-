@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 需要安装 Node.js 才能使用启动器。
  pause
  exit /b 1
)
echo 请让手机和电脑连接同一 Wi-Fi，并在手机浏览器输入下方显示的地址。
echo 保持此窗口开启。普通 HTTP 地址可用文字练习和手机键盘的语音输入。
node server.cjs --mobile --open
if errorlevel 1 pause
