好的，以下是对 `@/graph` 目录（即 `packages/graph`）的结构、核心概念、常用图形类型、以及 `src/models` 下主要行为的总结和背景知识文档，便于后续 AI 编程工具理解和参考。

---

# hfdraw `@/graph` 目录背景知识

## 1. 目录定位与作用

- `@/graph`（即 `packages/graph`）是 hfdraw 项目的核心图形引擎模块，负责图形的渲染、交互、数据结构、事件管理等。
- 该模块为上层应用（如流程图、思维导图、UML等）提供了通用的图形建模和操作能力。

---

## 2. 主要目录结构

```
packages/graph/
├── src/
│   ├── models/         # 图形、边、交互等核心模型
│   ├── shape/          # 各种图形/边的 Vue 组件
│   ├── util/           # 工具函数
│   ├── types/          # 类型定义
│   ├── GraphView.vue   # 主视图组件
│   ├── DiagramShape.vue# 图形渲染入口
│   └── ...             # 其他辅助文件
├── package.json
└── ...
```

---

## 3. 常用图形类型（ShapeType）

- **Symbol（节点/图形）**：如矩形、圆、菱形等，通常用于表示实体、步骤等。
- **Edge（连线/边）**：如直线、折线（elbow）、曲线等，用于连接两个节点。
- **MindMapShape**：思维导图专用节点。
- **其他**：如分组、注释等。

### 典型 Shape 结构
```ts
interface Shape {
  id: string;
  shapeType: 'Symbol' | 'Edge' | ...;
  bounds: { x, y, width, height, absX, absY };
  nameBounds?: { ... };
  modelName?: string;
  style: { ... };
  waypoint?: IPoint[]; // Edge 专用，表示折线的各个点
  sourceId?: string;   // Edge 专用
  targetId?: string;   // Edge 专用
  ...
}
```

---

## 4. 关键模型与行为（src/models/）

### 4.1 GraphModel
- **全局图形管理器**，维护所有 shape/edge 的 Map，负责事件分发、模型初始化、全局操作等。
- 通过 `emitter` 事件系统与各子模型通信。
- 维护 selectionModel、moveModel、edgeMoveModel、hoverModel、resizeModel 等子模型。

### 4.2 SelectionModel
- 管理当前选中的图形（单选/多选）。
- 提供选中、取消选中、清空等操作。

### 4.3 MoveModel
- 管理节点（Symbol）拖动、批量移动等行为。
- 负责移动预览、最终位置提交等。

### 4.4 EdgeMoveModel
- 管理边（Edge）的端点拖动、线段拖动、折线编辑等行为。
- 负责生成折线预览、端点吸附、waypoint 计算等。

### 4.5 HoverModel
- 管理鼠标悬浮状态，支持高亮、辅助操作等。

### 4.6 ResizeModel
- 管理节点的缩放、拉伸等行为，支持预览和最终提交。

### 4.7 MindMapModel、LabelEditorModel、MarkerModel
- 分别用于思维导图、标签编辑、图形高亮等特定场景。

---

## 5. 典型渲染与交互流程

- **GraphView.vue**：主视图，负责 SVG 画布、事件捕获、各类图形/边的渲染。
- **DiagramShape.vue**：遍历所有 shape，按类型渲染对应的 Vue 组件（如 SymbolShape、CommonEdge）。
- **SymbolShape.vue**：节点图形的具体渲染与交互（如高亮、编辑）。
- **CommonEdge.vue**：边/连线的渲染，支持折线、箭头等。

---

## 6. 折线（Elbow Edge）与 Waypoint

- 折线（elbow edge）通过 `waypoint` 属性存储所有折点坐标。
- 折线的生成、编辑、预览等由 `EdgeMoveModel` 负责，通常调用 `generateRectConnectRoute` 等算法生成最优路径。

---

## 7. 事件与状态流

- 所有交互（点击、拖动、悬浮、编辑等）都通过 `emitter` 事件系统分发，模型响应后更新状态，驱动视图响应式更新。
- 例如：拖动端点时，`EdgeMoveModel` 生成预览路径，`SymbolShape` 根据 `showPreview` 和悬浮状态高亮。

---

## 8. 典型用法举例

- **添加节点**：调用 GraphModel 的 addShape，自动加入 shapeMap 并渲染。
- **连线**：创建 EdgeShape，设置 sourceId/targetId、waypoint，渲染为 CommonEdge。
- **节点移动**：MoveModel 处理拖动，更新 bounds，相关连线自动调整。
- **折线编辑**：EdgeMoveModel 处理端点/线段拖动，更新 waypoint，实时预览。

---

## 9. 设计理念

- **响应式**：所有模型和 shape 都是 reactive/shallowReactive，保证视图自动响应数据变化。
- **解耦**：模型、事件、渲染分离，便于扩展和维护。
- **通用性**：支持多种图形类型和交互方式，适配多种业务场景。

---

# 总结

`@/graph` 是 hfdraw 的核心图形引擎，负责所有图形/边的渲染、交互、数据和事件管理。  
其模型层（src/models）高度解耦，支持丰富的图形类型和交互方式，适合流程图、思维导图、UML 等多种场景。  
常用图形包括节点（Symbol）、连线（Edge）、思维导图节点等，折线（elbow edge）通过 waypoint 管理所有折点。  
所有操作都通过事件系统驱动，模型响应后自动更新视图。

---

如需更详细的某一部分说明或代码示例，请随时提问！