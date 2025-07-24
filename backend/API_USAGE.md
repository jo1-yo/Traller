# Query Service API 使用说明

## 概述

这个后端服务提供了一个强大的查询API，可以处理用户输入的链接或人物信息，通过集成Perplexity搜索和Kimi K2 API来提供结构化的数据响应。

## 功能特性

1. **结构化数据处理**: 将非结构化文本转换为统一格式的JSON数据
2. **关系识别**: 识别实体间的关系类型和强度评分
3. **证据提取**: 提取支持关系的原文片段和链接
4. **数据持久化**: 使用SQLite数据库存储查询结果

## API 端点

### 1. 处理查询

**POST** `/api/query`

**请求体:**
```json
{
  "query": "查询内容（链接或人物信息）",
  "queryType": "link" | "person" | "other" (可选)
}
```

**响应:**
```json
{
  "id": 1,
  "originalQuery": "原始查询内容",
  "queryType": "查询类型",
  "entities": [
    {
      "id": 0,
      "name": "实体名称",
      "tag": "people" | "company",
      "avatar_url": "头像链接或null",
      "relationship_score": 8,
      "summary": "简短摘要",
      "description": "详细描述，包含引用标记[1], [2]",
      "links": [
        {
          "index": 1,
          "url": "https://example.com/source_one"
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. 获取单个查询结果

**GET** `/api/query/:id`

**响应:** 与POST请求相同的数据结构

### 3. 获取所有查询结果

**GET** `/api/query`

**响应:** 查询结果数组

### 4. 删除查询结果

**DELETE** `/api/query/:id`

**响应:**
```json
{
  "success": true,
  "message": "Query result with ID 1 deleted successfully"
}
```

## 配置说明

### 环境变量

在 `.env` 文件中配置以下变量：

```env
# 数据库配置
DATABASE_PATH=./database.sqlite

# Perplexity API 配置
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_API_URL=https://api.perplexity.ai

# Kimi K2 API 配置
KIMI_API_KEY=your_kimi_api_key_here
KIMI_API_URL=https://api.moonshot.cn/v1

# 服务器配置
PORT=3000
NODE_ENV=development
```

### API密钥获取

1. **Perplexity API**: 访问 [Perplexity AI](https://www.perplexity.ai/) 获取API密钥
2. **Kimi K2 API**: 访问 [月之暗面](https://platform.moonshot.cn/) 获取API密钥

## 启动服务

```bash
# 安装依赖
pnpm install

# 开发模式启动
pnpm run start:dev

# 生产模式启动
pnpm run start:prod
```

## 数据结构说明

### 实体数据结构

- **id**: 唯一标识符，主角为0
- **name**: 实体名称
- **tag**: 实体类型（'people' | 'company'）
- **avatar_url**: 头像或Logo链接
- **relationship_score**: 关系紧密度评分（1-10）
- **summary**: 卡片显示用的简短摘要
- **description**: 详细描述（Markdown格式，包含引用标记）
- **links**: 证据链接数组，与description中的引用标记对应

### 数据库表结构

1. **query_results**: 存储查询结果的主要信息
2. **entity_relationships**: 存储实体关系的详细信息

## 错误处理

API会返回标准的HTTP状态码：

- **200**: 成功
- **400**: 请求参数错误
- **404**: 资源未找到
- **500**: 服务器内部错误

错误响应格式：
```json
{
  "status": 500,
  "error": "错误类型",
  "message": "详细错误信息"
}
```

## 使用示例

```bash
# 查询人物信息
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Elon Musk Tesla SpaceX",
    "queryType": "person"
  }'

# 查询链接信息
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "https://www.tesla.com/about",
    "queryType": "link"
  }'
```