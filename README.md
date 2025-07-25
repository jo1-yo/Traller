# 萃流 (Traller) - AI驱动的深度人物情报与关系网络探索平台

萃流是一个先进的AI驱动的探索工具，旨在深度解析人物、公司及其错综复杂的关系网络。通过输入一个查询（如人物姓名、公司名称或相关链接），萃流能够利用大语言模型（LLM）进行深度分析，并以直观、可交互的关系图谱形式，为您呈现结构化的情报数据。

![Traller UI Demo](frontend/logo%20Traller(1).png)

---

## ✨ 核心功能

- **🤖 AI 深度分析**: 利用强大的语言模型（如 Google Gemini）自动从海量网络信息中提取、结构化并总结实体关系。
- **🕸️ 可视化关系图谱**: 以动态、可交互的图谱形式展示实体间的关系，关系远近一目了然。
- ** multifaceted 实体支持**: 支持对多种实体类型（包括人物、公司和事件）进行分析和展示。
- **📝 详细实体洞察**: 为每个实体提供详细的背景信息、摘要、关键事件和信息来源，所有内容均由AI自动生成。
- **💅 现代化的 UI/UX**: 采用 Vite + React 构建，界面美观、响应迅速，并拥有酷炫的 3D 动画效果。

---

## 🛠️ 技术栈

- **后端**:
  - [NestJS](https://nestjs.com/): 一个用于构建高效、可扩展的 Node.js 服务器端应用程序的渐进式框架。
  - **AI 集成**: [Google Gemini](https://ai.google/discover/gemini/) (通过 [OpenRouter](https://openrouter.ai/))
  - **语言**: TypeScript
- **前端**:
  - [React](https://reactjs.org/): 用于构建用户界面的 JavaScript 库。
  - [Vite](https://vitejs.dev/): 下一代前端开发与构建工具。
  - [Tailwind CSS](https://tailwindcss.com/): 一个功能类优先的 CSS 框架。
  - [Framer Motion](https://www.framer.com/motion/): 一个用于 React 的动画库。
  - [React Flow](https://reactflow.dev/): 用于构建基于节点的 UI 和应用的库。
- **包管理器**: [pnpm](https://pnpm.io/)

---

## 🚀 本地设置与运行

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd Traller
```

### 2. 安装依赖

本项目使用 `pnpm` 作为包管理器。请确保您已安装 `pnpm`。

```bash
# 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 在项目根目录安装所有依赖
pnpm install
```
`pnpm install` 会自动安装根目录、`frontend` 和 `backend` 的所有依赖。

### 3. 配置 API 密钥

为了让AI分析功能正常工作，您需要配置 API 密钥。

- 复制 `backend/.env.example` 文件，并将其重命名为 `backend/.env`。
- 在 `backend/.env` 文件中填入您的 API 密钥：

```env
# backend/.env

# OpenRouter API Key
# 从 https://openrouter.ai/keys 获取你的 API 密钥
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Tavily API Key (可选, 但建议配置)
# 从 https://app.tavily.com/ 获取
TAVILY_API_KEY=your_tavily_api_key_here
```

### 4. 启动项目

我们提供了便捷的脚本来一键启动和停止整个应用。

```bash
# 为脚本添加执行权限 (首次运行时需要)
chmod +x start.sh stop.sh

# 启动项目 (会同时启动前端和后端服务)
./start.sh
```

启动后，您可以访问：
- **前端**: `http://localhost:5173`
- **后端**: `http://localhost:3000`

### 5. 停止项目

```bash
# 停止所有服务
./stop.sh
```

---

## 🤝 贡献

欢迎对本项目进行贡献！如果您有任何想法或建议，请随时提交 Pull Request 或创建 Issue。
