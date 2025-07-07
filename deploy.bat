@echo off

REM 进入 Nest 项目目录
cd /d "%~dp0services" || exit /b 1

REM 设置目标目录
set NODE_SERVER_DIR=..\apps\draw-client\nodeServer

REM 创建目录（如果不存在）
if not exist "%NODE_SERVER_DIR%" mkdir "%NODE_SERVER_DIR%"

REM 使用 robocopy 复制 dist 目录（镜像同步）
robocopy dist "%NODE_SERVER_DIR%\dist" /mir /njh /njs /np

REM 复制单个文件
copy /y package.json "%NODE_SERVER_DIR%"
copy /y pnpm-lock.yaml "%NODE_SERVER_DIR%"

echo NodeServer 部署完成！
pause