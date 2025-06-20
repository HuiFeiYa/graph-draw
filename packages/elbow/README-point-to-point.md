# 点到点路径生成功能

## 概述

本功能提供了在两个点之间生成路径的能力，支持直线和智能折线两种模式。生成的路径点可以直接与 `WaypointUtil` 配合使用来创建 SVG 路径。

## 功能特性

- ✅ 支持直线路径生成
- ✅ 支持智能折线路径生成（基于 A* 算法）
- ✅ 兼容多种点格式（`IPoint` 和 `Point`）
- ✅ 自动错误处理和回退机制
- ✅ 与现有 `WaypointUtil` 完美集成
- ✅ TypeScript 类型安全

## API 文档

### 主要函数

#### `generatePointToPointRoute(startPoint, endPoint, options?)`

主要的路径生成函数，支持多种配置选项。

**参数：**
- `startPoint: IPoint | Point` - 起点坐标
- `endPoint: IPoint | Point` - 终点坐标
- `options?: PointToPointOptions` - 可选配置

**返回值：**
- `Point[]` - 路径点数组

**配置选项：**
```typescript
interface PointToPointOptions {
    routeType?: RouteType;     // 路径类型：'straight' | 'elbow'
    margin?: number;           // 折线时的边距（默认30）
    fakeRectSize?: number;     // 生成假矩形的大小（默认10）
}
```

#### `generateStraightLine(startPoint, endPoint)`

生成直线路径的简化函数。

**参数：**
- `startPoint: IPoint | Point` - 起点坐标
- `endPoint: IPoint | Point` - 终点坐标

**返回值：**
- `Point[]` - 包含起点和终点的数组

#### `generateSmartRoute(startPoint, endPoint, margin?)`

生成智能折线路径的简化函数。

**参数：**
- `startPoint: IPoint | Point` - 起点坐标
- `endPoint: IPoint | Point` - 终点坐标
- `margin?: number` - 可选的边距设置

**返回值：**
- `Point[]` - 折线路径点数组

### 类型定义

```typescript
// 路径类型枚举
enum RouteType {
    STRAIGHT = 'straight',
    ELBOW = 'elbow'
}

// 点格式（数组形式）
type Point = [number, number];

// 点格式（对象形式）
interface IPoint {
    x: number;
    y: number;
}
```

## 使用示例

### 基础用法

```typescript
import { 
    generatePointToPointRoute, 
    generateStraightLine, 
    generateSmartRoute,
    RouteType 
} from '@hfdraw/elbow';

// 1. 生成直线路径
const startPoint = { x: 100, y: 100 };
const endPoint = { x: 300, y: 200 };

const straightPath = generateStraightLine(startPoint, endPoint);
// 结果: [[100, 100], [300, 200]]

// 2. 生成智能折线路径
const smartPath = generateSmartRoute(startPoint, endPoint);
// 结果: [[100, 100], [150, 100], [150, 200], [300, 200]] (示例)

// 3. 使用主函数进行详细配置
const customPath = generatePointToPointRoute(startPoint, endPoint, {
    routeType: RouteType.ELBOW,
    margin: 50,
    fakeRectSize: 15
});
```

### 与 WaypointUtil 集成

```typescript
import { generateSmartRoute } from '@hfdraw/elbow';
import { waypointUtil } from '@hfdraw/graph';

// 生成路径点
const pathPoints = generateSmartRoute(
    { x: 0, y: 0 }, 
    { x: 200, y: 100 }
);

// 转换为 SVG 路径
const svgPath = waypointUtil.getPointsPath(pathPoints);
console.log(svgPath); // "M 0 0 L 100 0 L 100 100 L 200 100"
```

### 支持不同的点格式

```typescript
// 对象格式
const point1 = { x: 10, y: 20 };
const point2 = { x: 100, y: 80 };

// 数组格式
const point3: Point = [10, 20];
const point4: Point = [100, 80];

// 两种格式都支持
const path1 = generateStraightLine(point1, point2);
const path2 = generateStraightLine(point3, point4);
// 结果相同
```

### 错误处理

```typescript
try {
    const path = generateSmartRoute(startPoint, endPoint);
    console.log('生成的路径:', path);
} catch (error) {
    console.error('路径生成失败:', error);
    // 自动回退机制已内置，通常不会抛出异常
}
```

## 算法说明

### 直线模式 (STRAIGHT)
- 简单地连接起点和终点
- 适用于简单的点对点连接
- 性能最优

### 折线模式 (ELBOW)
- 基于现有的 A* 算法和肘形路径生成
- 在起点和终点周围创建小的假矩形
- 使用智能路径规划避免重叠
- 自动优化拐点数量
- 如果生成失败，自动回退到直线模式

## 性能考虑

- **直线模式**：O(1) 时间复杂度，适合大量简单连线
- **折线模式**：O(n²) 时间复杂度（其中 n 是网格点数），适合需要智能路径规划的场景
- 建议在性能敏感的场景下优先使用直线模式
- 折线模式包含自动回退机制，确保总是能返回有效路径

## 注意事项

1. **坐标系统**：使用标准的 2D 坐标系统，原点在左上角
2. **单位**：坐标值的单位取决于你的应用场景（通常是像素）
3. **边距设置**：折线模式的边距会影响路径的弯曲程度
4. **假矩形大小**：较小的假矩形会产生更紧密的路径，较大的会产生更宽松的路径

## 扩展性

该功能设计为可扩展的，未来可以添加：
- 更多路径类型（如贝塞尔曲线）
- 自定义避障逻辑
- 路径平滑算法
- 性能优化选项