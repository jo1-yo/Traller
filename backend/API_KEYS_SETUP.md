# API密钥配置指南

## 🚨 重要：API密钥问题

当前项目遇到 **Perplexity API 401错误**，需要配置有效的API密钥。

## 🔑 获取API密钥

### 1. Perplexity API
- 访问：https://www.perplexity.ai/settings/api
- 创建账户并获取API密钥
- 格式：`pplx-xxxxxxxxxxxxxxxxxxxxxxxx`

### 2. MiniMax API  
- 访问：https://api.minimaxi.com/
- 注册账户并获取JWT token
- 格式：`eyJhbGci...` (很长的JWT字符串)

### 3. Tavily API
- 访问：https://app.tavily.com/
- 注册账户并获取API密钥
- 格式：`tvly-xxxxxxxxxxxxxxxxxxxxxxxx`

## 🛠️ 配置方法

### 方法1：修改代码中的硬编码密钥

编辑以下文件，替换为您的有效API密钥：

**backend/src/services/perplexity.service.ts**
```javascript
this.apiKey = '您的Perplexity API密钥';
```

**backend/src/services/minimax.service.ts**  
```javascript
this.apiKey = '您的MiniMax JWT token';
```

**backend/src/services/tavily.service.ts**
```javascript
this.apiKey = '您的Tavily API密钥';
```

### 方法2：使用环境变量（推荐）

1. 在backend目录创建`.env`文件：
```bash
cd backend
touch .env
```

2. 在`.env`文件中添加：
```env
PERPLEXITY_API_KEY=您的Perplexity API密钥
MINIMAX_API_KEY=您的MiniMax JWT token
TAVILY_API_KEY=您的Tavily API密钥
```

3. 修改服务文件使用环境变量（见下方代码）

## 🔧 快速修复

如果您有有效的API密钥，请执行：

1. **替换Perplexity密钥**：
   编辑 `backend/src/services/perplexity.service.ts` 第38行

2. **重启后端服务**：
   ```bash
   cd backend
   # 停止当前服务 (Ctrl+C)
   pnpm run start:dev
   ```

3. **测试API**：
   ```bash
   pnpm run test:service quick
   ```

## ⚠️ 注意事项

- API密钥需要有足够的配额
- 确保网络连接正常
- Perplexity API需要付费账户才能正常使用
- 测试建议使用简单查询如"马云"或"Elon Musk"

## 💡 获取免费测试密钥

如果您需要测试用的API密钥，可以：
1. 注册各平台的免费试用账户
2. 查看各平台的免费配额政策
3. 使用官方提供的示例密钥（如果有）

---

**配置完成后，重启后端服务即可正常使用！** 