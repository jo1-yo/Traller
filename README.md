# 萃流 (Traller) - 人物智能探索系统

## 项目简介

萃流是一个基于AI的**人物智能探索系统**，通过整合多个AI服务，帮助用户深度分析和可视化人物关系网络。系统能够搜集人物信息、分析关系网络、并以直观的方式展示复杂的人际关系。

## ✨ 核心特性

- 🔍 **智能搜索**: 基于Perplexity的深度信息搜集
- 🤖 **AI结构化**: 使用Google Gemini 2.5 Flash进行数据结构化
- 🎨 **可视化展示**: React Flow动态关系图谱
- 📱 **响应式设计**: 现代化的用户界面
- 🚀 **实时处理**: 无数据库的轻量级架构

## 🛠 技术栈

### 后端
- **框架**: NestJS + TypeScript
- **AI服务**:
  - **Perplexity API** (sonar-pro模型) - 信息搜索
  - **Google Gemini 2.5 Flash** (via OpenRouter) - 数据结构化
  - **Tavily API** - 头像/Logo增强
- **部署**: Node.js + pnpm

### 前端
- **框架**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **可视化**: React Flow (关系图谱)
- **动画**: Framer Motion
- **Markdown**: React Markdown + remark

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 1. 克隆项目
```bash
git clone <repository-url>
cd Traller
```

### 2. 安装依赖
```bash
# 安装根目录依赖
pnpm install

# 安装后端依赖
cd backend && pnpm install

# 安装前端依赖
cd ../frontend && pnpm install
```

### 3. 配置API密钥

创建 `backend/.env` 文件：
```env
# OpenRouter API配置 (用于Gemini 2.5 Flash)
OPENROUTER_API_KEY=sk-or-v1-your-api-key

# Perplexity API配置
PERPLEXITY_API_KEY=pplx-your-api-key

# Tavily API配置
TAVILY_API_KEY=tvly-your-api-key
```

### 4. 启动服务

```bash
# 启动后端 (终端1)
cd backend
pnpm run start:dev

# 启动前端 (终端2)
cd frontend
pnpm run dev
```

### 5. 访问应用
- **前端**: http://localhost:5173
- **后端API**: http://localhost:3000

## 📖 使用指南

### 基本使用
1. 打开前端应用
2. 在搜索框输入人物姓名（如："马云", "Elon Musk"）
3. 等待2-4分钟处理
4. 查看关系网络图谱
5. 点击实体卡片查看详细信息

### 高级功能
- **关系过滤**: 按人物/公司类型筛选
- **关系评分**: 1-10分的关系紧密度
- **详细描述**: 支持Markdown格式的详细信息
- **引用链接**: 每个信息都有来源链接

## 🔧 开发指南

### API接口
```bash
POST /api/query
Content-Type: application/json

{
  "query": "查询的人物姓名"
}
```

### 测试命令
```bash
# 后端单元测试
cd backend
pnpm run test

# API功能测试
pnpm run data test "马云"

# 前端测试
cd frontend
pnpm run test
```

## 📁 项目结构

```
Traller/
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── controllers/     # API控制器
│   │   ├── services/        # 业务逻辑服务
│   │   ├── dto/            # 数据传输对象
│   │   └── entities/       # 实体定义
│   ├── scripts/            # 工具脚本
│   └── docs/               # 后端文档
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   ├── lib/           # 工具函数
│   │   └── types/         # TypeScript类型
└── docs/                  # 项目文档
```

## 📚 文档

- 📋 [API配置指南](backend/GEMINI_API_SETUP.md)
- 🚀 [高上下文优化](backend/HIGH_CONTEXT_OPTIMIZATION.md)
- 🔧 [安装指南](SETUP_GUIDE.md)
- 🏃 [运行指南](RUNNING_GUIDE.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

**探索人物关系，发现无限可能！** 🌟
