@echo off
echo ===================================================
echo   正在配置并启动 MyBlog 后端守护进程 (PM2)
echo ===================================================

cd /d "%~dp0\server"

echo 1. 检查并全局安装 PM2...
call npm install -g pm2

echo.
echo 2. 启动后端服务...
call npx pm2 start src/server.js --name "myblog-backend" --watch

echo.
echo 3. 保存 PM2 进程列表...
call npx pm2 save

echo.
echo ===================================================
echo 后端已在后台持续运行！
echo 常用命令：
echo - 查看状态：pm2 status
echo - 查看日志：pm2 logs myblog-backend
echo - 停止服务：pm2 stop myblog-backend
echo - 重启服务：pm2 restart myblog-backend
echo ===================================================
pause
