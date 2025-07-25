#!/bin/bash

# Traller 项目启动脚本
# 同时启动前端和后端服务

echo "🚀 启动 Traller 项目..."
echo "================================"

# 检查是否安装了 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: 未找到 pnpm，请先安装 pnpm"
    echo "安装命令: npm install -g pnpm"
    exit 1
fi

# 检查项目目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 未找到 backend 或 frontend 目录"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 安装依赖（如果需要）
echo "📦 检查并安装依赖..."

# 安装根目录依赖
if [ ! -d "node_modules" ]; then
    echo "安装根目录依赖..."
    pnpm install
fi

# 安装后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "安装后端依赖..."
    cd backend
    pnpm install
    cd ..
fi

# 安装前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "安装前端依赖..."
    cd frontend
    pnpm install
    cd ..
fi

echo "✅ 依赖检查完成"
echo "================================"

# 创建日志目录
mkdir -p logs

# 启动后端服务
echo "🔧 启动后端服务 (NestJS)..."
cd backend
pnpm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "后端服务已启动，PID: $BACKEND_PID"
echo "后端日志: logs/backend.log"

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 启动前端服务
echo "🎨 启动前端服务 (Vite)..."
cd frontend
pnpm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "前端服务已启动，PID: $FRONTEND_PID"
echo "前端日志: logs/frontend.log"

echo "================================"
echo "🎉 Traller 项目启动完成！"
echo "================================"
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端地址: http://localhost:3000"
echo "📋 日志目录: logs/"
echo "================================"
echo "💡 使用说明:"
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 查看后端日志: tail -f logs/backend.log"
echo "   - 查看前端日志: tail -f logs/frontend.log"
echo "================================"

# 保存 PID 到文件，方便后续停止
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

# 等待用户中断
trap 'echo "\n🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ 所有服务已停止"; exit 0' INT

# 保持脚本运行
echo "⌨️  按 Ctrl+C 停止所有服务"
while true; do
    sleep 1
done