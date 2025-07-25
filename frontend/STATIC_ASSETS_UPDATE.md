# 前端静态资源重构更新说明

## 更新概述

本次更新重新组织了前端的静态资源结构，并将背景从静态图片更换为动态视频背景，提升了用户界面的视觉效果。

## 文件结构变更

### 新增目录结构
```
frontend/public/
├── images/
│   └── logos/
│       ├── logo Traller(1).png
│       ├── logo Traller(2)-57.png
│       ├── logo Traller(3)-56.png
│       ├── logo Traller(PLUS)-48.png
│       └── logo Traller(PLUS)-49.png
└── videos/
    └── background.mp4
```

### 文件移动记录
- `frontend/logo*.png` → `frontend/public/images/logos/`
- `frontend/background video.mp4` → `frontend/public/videos/background.mp4`

## 代码更新

### 1. 图片路径更新
更新了所有logo图片的引用路径：

**frontend/index.html**
- favicon路径: `/logo Traller(1).png` → `/images/logos/logo Traller(1).png`

**frontend/src/App.tsx**
- 导航栏logo: `/logo Traller(1).png` → `/images/logos/logo Traller(1).png`

**frontend/src/components/QueryInterface.tsx**
- 主页logo: `/logo Traller(1).png` → `/images/logos/logo Traller(1).png`

### 2. 背景视频实现
在 `frontend/src/App.tsx` 中添加了视频背景：

```tsx
{/* 背景视频 */}
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0"
>
  <source src="/videos/background.mp4" type="video/mp4" />
</video>

{/* 视频遮罩层 */}
<div className="absolute inset-0 bg-black/60 z-5"></div>
```

### 3. 样式优化
为了适配视频背景，更新了多个组件的样式：

**QueryInterface组件**
- 添加半透明背景: `bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10`

**App.tsx导航栏**
- 背景: `bg-card/80` → `bg-black/40 backdrop-blur-md`
- 边框: `border-border` → `border-white/20`
- 文字颜色: `text-foreground` → `text-white`, `text-muted-foreground` → `text-gray-300`

**RelationshipCanvas组件**
- 控制面板背景: `bg-card/80` → `bg-black/40 backdrop-blur-md`
- 边框: `border-border` → `border-white/20`
- 文字颜色: `text-muted-foreground` → `text-gray-300`, `text-foreground` → `text-white`
- MiniMap样式: `!bg-card/80 !border-border` → `!bg-black/40 !border-white/20 backdrop-blur-md`

**index.css**
- 移除了原有的静态背景样式
- 简化了body样式，移除了复杂的渐变背景

## 技术特性

### 视频背景特性
- **自动播放**: `autoPlay` 属性确保视频自动开始播放
- **循环播放**: `loop` 属性使视频无限循环
- **静音播放**: `muted` 属性避免自动播放被浏览器阻止
- **移动端兼容**: `playsInline` 属性确保在iOS设备上正常播放
- **响应式**: `object-cover` 确保视频填满整个屏幕且保持比例

### 视觉层次
- **z-index 0**: 背景视频层
- **z-index 5**: 视频遮罩层（黑色半透明，透明度60%）
- **z-index 10**: 内容层

### 毛玻璃效果
使用 `backdrop-blur-sm` 和 `backdrop-blur-md` 类为各种UI组件添加毛玻璃效果，增强视觉层次感。

## 兼容性说明

- 支持现代浏览器的视频自动播放
- 移动端设备友好
- 保持了原有的响应式设计
- 所有交互功能保持不变

## 启动说明

项目启动方式保持不变：
```bash
# 前端 (端口可能会自动调整)
cd frontend && pnpm run dev

# 后端
cd backend && pnpm run start:dev
```

当前运行地址：
- 前端: http://localhost:5174
- 后端: http://localhost:3000
