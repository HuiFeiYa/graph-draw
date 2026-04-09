# @hfdraw/graph

HfDraw 项目的核心图形渲染引擎包，负责处理所有图形元素的渲染、交互和管理。

## 功能特性

- 🎨 支持多种图形类型（Symbol、Edge、MindMap等）
- 🖱️ 完整的交互系统（拖拽、选择、缩放、编辑）
- 📐 可配置的画布大小和滚动功能
- 🔄 响应式数据更新
- 🎯 事件驱动的架构设计

## 画布大小设置

### 基本用法

```typescript
import { GraphModel } from '@hfdraw/graph';

// 创建图形模型
const graphModel = new GraphModel(graphOption);

// 获取当前画布大小
const size = graphModel.getCanvasSize();
console.log(`画布大小: ${size.width} x ${size.height}`);
```

### 滚动功能

画布默认启用滚动功能，当内容超出可视区域时自动显示滚动条。

```typescript
// 设置滚动位置
graphModel.setScrollPosition(100, 200);

// 获取当前滚动位置
const scrollPos = graphModel.getScrollPosition();
console.log(`滚动位置: x=${scrollPos.x}, y=${scrollPos.y}`);
```

### 在Vue组件中使用

```vue
<template>
  <div class="canvas-container">
    <GraphView :graph="graphModel" />
  </div>
</template>

<script setup lang="ts">
import { GraphView, GraphModel } from '@hfdraw/graph';

const graphModel = new GraphModel(graphOption);

// 设置画布大小
graphModel.setCanvasSize(3000, 2000);

// 监听画布大小变化
watch(() => graphModel.getCanvasSize(), (newSize) => {
  console.log('画布大小已更新:', newSize);
});
</script>

<style>
.canvas-container {
  height: 100vh;
  overflow: auto; /* 启用滚动 */
}
</style>
```

## 配置选项

### 画布大小限制

- **最小尺寸**: 500px x 500px
- **默认尺寸**: 1000px x 1000px
- **最大尺寸**: 无限制（受内存限制）

### 滚动行为

- **默认启用**: 自动显示滚动条
- **滚动位置**: 支持程序化设置和获取
- **响应式**: 画布大小变化时自动调整滚动区域

## API 参考

### GraphModel

#### `setCanvasSize(width: number, height: number)`
设置画布大小，自动应用最小尺寸限制。

#### `getCanvasSize(): { width: number, height: number }`
获取当前画布大小。

#### `setScrollPosition(x: number, y: number)`
设置滚动位置。

#### `getScrollPosition(): { x: number, y: number }`
获取当前滚动位置。

### ViewModel

#### `setCanvasSize(width: number, height: number)`
设置画布大小，内部方法。

#### `getCanvasSize(): { width: number, height: number }`
获取画布大小，内部方法。

#### `setScrollPosition(x: number, y: number)`
设置滚动位置，内部方法。

#### `getScrollPosition(): { x: number, y: number }`
获取滚动位置，内部方法。

## 注意事项

1. **最小尺寸**: 画布大小不能小于500px，如果传入的值小于500px，会自动调整为500px
2. **性能考虑**: 过大的画布可能影响渲染性能，建议根据实际需求设置合适的大小
3. **滚动行为**: 画布默认启用滚动，可以通过CSS的`overflow`属性进行自定义
4. **响应式**: 画布大小变化会触发重新渲染，确保所有图形元素正确显示

## 示例项目

完整的使用示例请参考 `apps/draw-client/src/views/Flow.vue` 和 `apps/draw-client/src/views/MindMap.vue`。 