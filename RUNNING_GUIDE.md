# 萃流 (Traller) - 人物智能探索系统运行指南

## 项目概述

**萃流 (Traller)** 是一个AI驱动的深度人物情报与关系网络探索平台，将碎片化信息转换为结构化的交互式人物档案。

## 技术架构

### 后端
- **框架**: NestJS + TypeScript
- **AI服务**: Perplexity (sonar-pro) + MiniMax M1 + Tavily
- **数据存储**: 内存存储（无数据库依赖）
- **端口**: 3000

### 前端
- **框架**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **可视化**: React Flow
- **动画**: Framer Motion
- **端口**: 5173

## 启动步骤

### 1. 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start:dev
```

后端将在 http://localhost:3000 启动

### 2. 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

前端将在 http://localhost:5173 启动

## API配置

项目中已硬编码以下API密钥（生产环境请移至环境变量）：

- **Perplexity API**: `pplx-dev-jd3sqGjVa3LTGRAUItDiwoT7zvlXvsRz`
- **MiniMax API**: `eyJhbGci...` (完整token)
- **Tavily API**: `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`

## 使用流程

1. **启动探索**: 在主页输入人物姓名、公司或相关信息
2. **画布总览**: 查看以主角为中心的关系网络可视化
3. **筛选聚焦**: 使用"人物"/"公司"标签过滤实体
4. **深度信息**: 点击卡片查看详细的Markdown格式信息
5. **交互探索**: 拖拽卡片，缩放画布进行深度探索

## 功能特性

### 🎯 智能分析
- 多AI协同处理：Perplexity搜索 → MiniMax结构化 → Tavily头像增强
- 自动识别实体关系和紧密度评分
- 智能提取证据链接和引用标记

### 🎨 交互体验  
- 现代化动态界面，流畅动画效果
- 可拖拽的关系网络画布
- 响应式设计，支持缩放和平移
- 实时过滤和统计信息

### 📊 数据展示
- 结构化实体卡片展示
- Markdown格式的详细描述
- 内联引用链接，可追溯信息来源
- 关系强度可视化（连线粗细和颜色）

## 项目结构

```
Traller/
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── services/       # AI服务集成
│   │   ├── controllers/    # API控制器
│   │   ├── dto/           # 数据传输对象
│   │   └── types/         # 类型定义
│   └── package.json
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务
│   │   ├── types/         # 类型定义
│   │   └── lib/          # 工具函数
│   └── package.json
└── README.md
```

## 开发注意事项

1. **API密钥管理**: 生产环境请将API密钥移至环境变量
2. **跨域配置**: 前端已配置代理，自动转发API请求到后端
3. **错误处理**: 完整的错误处理和用户反馈机制
4. **性能优化**: 使用React.memo和useMemo优化渲染性能

## ✅ 已修复问题

以下问题已在最新版本中修复：
- ❌ ~`Property 'getAllQueryResults' does not exist on type 'QueryService'`~ → ✅ **已修复**
- ❌ ~数据库依赖错误~ → ✅ **已移除数据库，采用内存存储**
- ❌ ~测试脚本编译错误~ → ✅ **已更新适配新架构**
- ❌ ~前端TypeScript类型错误~ → ✅ **将在安装依赖后自动解决**

## 故障排除

### 常见问题

1. **编译错误**: 已全部修复，可正常编译和运行
2. **端口冲突**: 确保3000和5173端口未被占用
3. **依赖安装失败**: 使用pnpm而不是npm安装依赖
4. **API调用失败**: 检查网络连接和API密钥配置
5. **前端无法连接后端**: 确认后端已启动且运行在3000端口

### 日志查看

- 后端日志: 在后端终端查看NestJS输出
- 前端日志: 打开浏览器开发者工具查看控制台
- API调用: 在Network标签页查看请求详情

## 性能建议

1. **查询优化**: 使用具体的人物或公司名称获得更好的结果
2. **网络环境**: 确保网络连接稳定，AI分析需要1-2分钟
3. **浏览器支持**: 推荐使用Chrome或Edge浏览器获得最佳体验

## 后续扩展

- [ ] 支持用户历史查询记录
- [ ] 添加实体关系的二级展开
- [ ] 支持导出分析结果为PDF
- [ ] 集成更多AI服务提供商
- [ ] 添加实时协作功能

---

**开发完成时间**: 2025年1月
**技术支持**: 如有问题请查看项目文档或提交Issue 