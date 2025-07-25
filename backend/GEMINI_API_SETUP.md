# 🤖 OpenRouter Gemini API 配置指南

## 概述

系统已升级使用 **OpenRouter** 平台的 **Google Gemini 2.5 Flash** 模型，替代之前的MiniMax M1模型。Gemini 2.5 Flash具有更强的性能和更好的JSON格式支持。

## 🔑 API密钥获取

### 1. 注册OpenRouter账户
访问：https://openrouter.ai/

### 2. 获取API密钥
1. 登录后进入 Dashboard
2. 点击 "API Keys" 
3. 创建新的API密钥
4. 复制密钥（格式：`sk-or-v1-xxxxxx`）

### 3. 充值账户
- OpenRouter按使用量计费
- 建议充值 $5-10 用于测试
- Gemini 2.5 Flash 价格约 $0.075/1M tokens

## ⚙️ 配置方法

### 方法1：环境变量配置（推荐）

创建 `backend/.env` 文件：
```env
# OpenRouter API配置
OPENROUTER_API_KEY=sk-or-v1-你的真实密钥
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions

# 其他API密钥
PERPLEXITY_API_KEY=你的Perplexity密钥
TAVILY_API_KEY=你的Tavily密钥
```

### 方法2：直接修改代码

编辑 `backend/src/services/gemini.service.ts`：

```typescript
constructor(private configService: ConfigService) {
  this.apiKey = '你的OpenRouter密钥';  // 替换这里
  this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
}
```

## 🚀 模型优势

### Gemini 2.5 Flash vs MiniMax M1

| 特性 | Gemini 2.5 Flash | MiniMax M1 |
|------|------------------|------------|
| **JSON支持** | ✅ 原生支持 | ❌ 需要json_schema |
| **上下文长度** | 1M+ tokens | 较短 |
| **响应质量** | 更智能、更准确 | 一般 |
| **处理速度** | 快速响应 | 较慢 |
| **多语言支持** | 优秀 | 一般 |
| **成本** | $0.075/1M tokens | 收费模式复杂 |

### 技术特性
- ✅ **原生JSON输出**：无需复杂的格式化指令
- ✅ **高上下文理解**：支持长文本深度分析
- ✅ **多模态能力**：支持文本+图像（未来扩展）
- ✅ **稳定性强**：Google基础设施支持
- ✅ **格式灵活**：支持各种输出格式

## 🔧 测试验证

### 1. 检查配置
```bash
cd backend
grep -n "OPENROUTER" .env
```

### 2. 测试API连接
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的密钥" \
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 3. 运行服务测试
```bash
cd backend
pnpm run start:dev

# 另一个终端
pnpm run data test "马斯克"
```

## 📊 性能监控

### 关键指标
- **响应时间**: 通常 2-5 秒
- **Token消耗**: 输入+输出约 3000-8000 tokens
- **成功率**: > 95%
- **JSON格式准确率**: > 98%

### 日志检查
```bash
# 查看处理日志
tail -f logs/application.log | grep "GeminiService"

# 查看错误日志
tail -f logs/error.log | grep "Gemini API error"
```

## 🚨 故障排除

### 常见错误

#### 1. 认证错误
```
Error: Request failed with status code 401
```
**解决方案**: 检查API密钥是否正确配置

#### 2. 模型不可用
```
Error: Model not found
```
**解决方案**: 确认使用 `google/gemini-2.5-flash` 模型名

#### 3. Token超限
```
Error: Token limit exceeded
```
**解决方案**: 
- 检查输入文本长度
- 减少max_tokens设置
- 优化prompt内容

#### 4. 余额不足
```
Error: Insufficient credits
```
**解决方案**: 
- 在OpenRouter充值
- 检查账户余额

### 调试命令

```bash
# 检查服务状态
ps aux | grep "nest start"

# 检查端口占用
lsof -i :3000

# 重启服务
cd backend
pnpm run start:dev
```

## 💡 最佳实践

### 1. API密钥管理
- ✅ 使用环境变量
- ✅ 定期轮换密钥
- ❌ 不要提交到版本控制

### 2. 成本控制
- 设置使用限额
- 监控日常消耗
- 优化prompt长度

### 3. 性能优化
- 缓存常用查询结果
- 批量处理请求
- 合理设置超时时间

---

## ✅ 配置完成检查清单

- [ ] 获得OpenRouter API密钥
- [ ] 账户已充值
- [ ] 环境变量已配置
- [ ] 服务重启完成
- [ ] 测试查询成功
- [ ] 日志显示正常

**配置完成后，系统将使用更强大的Gemini 2.5 Flash模型！** 🎉 