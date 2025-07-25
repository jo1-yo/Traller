# 🚨 快速修复：Perplexity API 401错误

## 问题描述
```
Query processing failed: Perplexity API error: Request failed with status code 401
```

## 🔧 立即修复方案

### 方案1：使用环境变量（推荐）

1. **创建.env文件**
   ```bash
   cd backend
   touch .env
   ```

2. **添加有效的API密钥**
   编辑`.env`文件，添加：
   ```env
   PERPLEXITY_API_KEY=您的有效Perplexity API密钥
   MINIMAX_API_KEY=您的有效MiniMax JWT token
   TAVILY_API_KEY=您的有效Tavily API密钥
   ```

3. **重启后端服务**
   ```bash
   # 停止当前服务 (Ctrl+C)
   pnpm run start:dev
   ```

### 方案2：直接修改代码

编辑 `backend/src/services/perplexity.service.ts` 第36行：
```javascript
this.apiKey = this.configService.get<string>('PERPLEXITY_API_KEY') || '您的有效Perplexity API密钥';
```

## 🔑 获取API密钥

### Perplexity API
- 网址：https://www.perplexity.ai/settings/api
- 注册并创建API密钥
- 格式：`pplx-xxxxxxxxxxxxxxxxxxxxxxxx`
- 注意：需要付费账户

### MiniMax API
- 网址：https://api.minimaxi.com/
- 注册并获取JWT token
- 格式：`eyJhbGci...` (很长的JWT字符串)

### Tavily API
- 网址：https://app.tavily.com/
- 注册并获取API密钥
- 格式：`tvly-xxxxxxxxxxxxxxxxxxxxxxxx`

## ✅ 验证修复

1. **检查服务启动日志**
   ```bash
   cd backend
   pnpm run start:dev
   ```
   
   应该看到：
   ```
   [Nest] LOG [NestApplication] Nest application successfully started
   ```

2. **运行快速测试**
   ```bash
   pnpm run test:service quick
   ```

3. **测试前端**
   - 打开 http://localhost:5173
   - 输入"马云"进行测试

## 🆘 如果仍然出错

1. **检查API密钥格式**：确保密钥格式正确
2. **检查账户余额**：确保API账户有足够配额
3. **检查网络连接**：确保能访问API服务
4. **查看完整日志**：检查后端控制台的详细错误信息

## 💡 临时解决方案

如果暂时无法获取有效API密钥，可以：
1. 注册各平台的免费试用账户
2. 使用官方提供的示例数据（如果有）
3. 跳过失效的服务，只测试其他功能

---

**修复后，重启服务即可正常使用！** 