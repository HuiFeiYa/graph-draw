#!/bin/bash

# 进入 Nest 项目目录（services 目录，根据你的结构，假设在项目根目录下的 services）
cd "$(dirname "$0")/services" || exit 1

# 确保安装生产依赖

# 创建 nodeServer 目录（如果不存在），这里假设要把内容放到 draw-client/nodeServer
NODE_SERVER_DIR="../apps/draw-client/nodeServer"
mkdir -p "$NODE_SERVER_DIR"

# 复制 dist、package.json、pnpm-lock.yaml 到 nodeServer
cp -r dist "$NODE_SERVER_DIR"
cp package.json "$NODE_SERVER_DIR"
cp pnpm-lock.yaml "$NODE_SERVER_DIR"

# 进入 nodeServer 目录并安装生产依赖
# cd "$NODE_SERVER_DIR" || exit 1
# pnpm install --prod

echo "NodeServer 部署完成！"