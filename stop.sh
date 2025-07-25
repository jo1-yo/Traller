#!/bin/bash

# Traller 项目停止脚本
# 停止前端和后端服务

echo "🛑 停止 Traller 项目服务..."
echo "================================"

# 检查日志目录是否存在
if [ ! -d "logs" ]; then
    echo "❌ 未找到 logs 目录，可能服务未启动"
    exit 1
fi

# 停止后端服务
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔧 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ 后端服务已停止"
    else
        echo "⚠️  后端服务已经停止"
    fi
    rm -f logs/backend.pid
else
    echo "⚠️  未找到后端服务 PID 文件"
fi

# 停止前端服务
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止"
    else
        echo "⚠️  前端服务已经停止"
    fi
    rm -f logs/frontend.pid
else
    echo "⚠️  未找到前端服务 PID 文件"
fi

# 强制停止相关进程（备用方案）
echo "🔍 检查并清理残留进程..."

# 停止可能的 nest 进程
pkill -f "nest start" 2>/dev/null && echo "清理了 NestJS 进程"

# 停止可能的 vite 进程
pkill -f "vite" 2>/dev/null && echo "清理了 Vite 进程"

echo "================================"
echo "✅ Traller 项目服务已全部停止"
echo "================================"