# 🚨 MiniMax API JSON Schema错误修复

## 问题描述
```
MiniMax API error: invalid params, Mismatch type string with value array "at index 5926: mismatched type with value\n\n\tar_url\":{\"type\":[\"string\",\"null\"]\n"
```

## ✅ 问题已修复

我已经修复了MiniMax API的JSON Schema类型定义问题：

### 修复内容
1. **JSON Schema类型定义** - 将`avatar_url`从`["string", "null"]`改为`"string"`
2. **Prompt优化** - 更新提示词，指示AI返回空字符串而不是null
3. **前后端类型同步** - 统一avatar_url为string类型
4. **前端组件更新** - 修复头像显示逻辑

### 修复的文件
- ✅ `backend/src/services/minimax.service.ts` - JSON Schema修复
- ✅ `backend/src/dto/query.dto.ts` - 类型定义更新
- ✅ `frontend/src/types/index.ts` - 前端类型更新
- ✅ `frontend/src/components/EntityCard.tsx` - 头像显示逻辑
- ✅ `frontend/src/components/EntityDetailModal.tsx` - 详情页头像逻辑

## 🔧 应用修复

### 1. 重启后端服务
```bash
cd backend
# 停止当前服务 (Ctrl+C)
pnpm run start:dev
```

### 2. 重启前端服务  
```bash
cd frontend
# 停止当前服务 (Ctrl+C)
pnpm run dev
```

### 3. 验证修复
```bash
cd backend
pnpm run test:service quick
```

## 🎯 测试步骤

1. **后端测试**
   ```bash
   cd backend
   pnpm run data test "马云"
   ```

2. **前端测试**
   - 打开 http://localhost:5173
   - 输入"马云"或"Elon Musk"
   - 等待1-2分钟查看结果

## 📊 预期结果

修复后应该看到：
- ✅ 后端不再出现JSON Schema错误
- ✅ MiniMax API正常返回结构化数据
- ✅ 前端正确显示实体卡片和头像
- ✅ 详情弹窗正常工作

## 🔍 技术说明

**问题原因**: MiniMax API的JSON Schema不支持联合类型`["string", "null"]`，只支持单一类型。

**解决方案**: 
- 将`avatar_url`定义为`string`类型
- 空值用空字符串`""`表示，而不是`null`
- 前端检查`entity.avatar_url.trim() !== ''`来判断是否有头像

---

**重启服务后即可正常使用！** 🎉 