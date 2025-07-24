# API 更新报告

## 问题分析

经过对当前代码的分析，发现以下问题：

### 1. Perplexity API 使用过时模型

**问题：** 当前使用的是 `llama-3.1-sonar-large-128k-online` 模型

**解决方案：** 更新为最新的 `sonar-deep-research` 模型

**具体更改：**
- 移除了不必要的参数配置（如 `max_tokens`, `temperature`, `top_p` 等）
- 简化了消息结构，移除了 `system` 角色消息
- 使用更简洁的 API 调用格式

### 2. Kimi API 使用过时模型

**问题：** 当前使用的是 `moonshot-v1-32k` 模型

**解决方案：** 更新为最新的 `kimi-k2-0711-preview` 模型

**具体更改：**
- 更新了 system prompt，使用官方推荐的中文提示词
- 调整了 `temperature` 参数从 0.1 到 0.6（按照官方示例）
- 移除了 `max_tokens` 参数

## 代码更改详情

### Perplexity Service 更改

```typescript
// 之前的配置
{
  model: 'llama-3.1-sonar-large-128k-online',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful research assistant...'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  max_tokens: 4000,
  temperature: 0.2,
  // ... 其他参数
}

// 更新后的配置
{
  model: 'sonar-deep-research',
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ]
}
```

### Kimi Service 更改

```typescript
// 之前的配置
{
  model: 'moonshot-v1-32k',
  messages: [
    {
      role: 'system',
      content: 'You are a data structuring expert...'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.1,
  max_tokens: 8000
}

// 更新后的配置
{
  model: 'kimi-k2-0711-preview',
  messages: [
    {
      role: 'system',
      content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手...'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.6
}
```

## 新增功能

### API 测试脚本

创建了 `scripts/test-api-update.ts` 文件，用于测试更新后的 API 调用：

- 测试 Perplexity API 的 `sonar-deep-research` 模型
- 测试 Kimi API 的 `kimi-k2-0711-preview` 模型
- 验证完整的数据处理流程

### 新增 npm 脚本

在 `package.json` 中添加了新的测试命令：

```bash
npm run test:api
```

## 优势和改进

### 1. 性能提升
- `sonar-deep-research` 模型提供更深入的研究能力
- `kimi-k2-0711-preview` 模型具有更强的中文理解和处理能力

### 2. 代码简化
- 移除了不必要的参数配置
- 简化了 API 调用结构
- 提高了代码的可维护性

### 3. 更好的本地化支持
- Kimi API 使用官方推荐的中文 system prompt
- 更好地支持中文查询和响应

## 注意事项

1. **API 密钥配置**：确保在 `.env` 文件中正确配置了 API 密钥
2. **网络连接**：新模型可能需要稳定的网络连接
3. **成本考虑**：新模型的调用成本可能与旧模型不同
4. **兼容性**：建议在生产环境部署前进行充分测试

## 性能优化更新

### 超时时间优化

- **Perplexity API**: 超时时间增加到2分钟 (120秒)
- **Kimi API**: 超时时间增加到90秒
- **整体查询处理**: 客户端超时增加到3分钟 (180秒)
- **服务器超时**: 设置为5分钟，支持长时间API调用

### API参数优化

- **Perplexity**: 
  - `max_tokens`: 4000 (增加输出长度)
  - `temperature`: 0.3 (提高稳定性)
  - `stream`: false (确保完整响应)

- **Kimi**: 
  - `max_tokens`: 3000 (增加输出长度)
  - `temperature`: 0.3 (提高JSON输出稳定性)
  - `stream`: false (确保完整响应)

### 流式处理准备

已创建 `StreamService` 为未来的流式API调用做准备，当前使用非流式模式以确保稳定性。

## 测试建议

1. 启动开发服务：
   ```bash
   cd backend
   pnpm start
   ```

2. 运行服务测试脚本验证功能：
   ```bash
   npm run test:service
   ```

3. 测试完整的查询流程：
   ```bash
   curl -X POST http://localhost:3000/api/query \
     -H "Content-Type: application/json" \
     -d '{"query": "马斯克", "queryType": "people"}'
   ```

4. 监控 API 响应时间和质量

## 总结

本次更新成功将 API 调用升级到最新的模型版本，提高了系统的性能和准确性。通过简化配置和优化参数，代码变得更加简洁和易于维护。建议在部署到生产环境前进行充分的测试验证。