# HFDraw 服务端项目结构说明

## 项目概述

HFDraw 是一个基于 NestJS 框架构建的绘图应用服务端，主要提供绘图项目的管理、图形操作、步骤管理等功能。项目采用 TypeScript 开发，使用 SQLite 数据库存储数据，支持 WebSocket 实时通信。

## 技术栈

- **框架**: NestJS (Node.js 框架)
- **数据库**: SQLite (better-sqlite3)
- **ORM**: TypeORM
- **实时通信**: WebSocket (ws)
- **语言**: TypeScript
- **包管理**: pnpm
- **构建工具**: Webpack

## 项目结构

```
services/
├── src/
│   ├── main.ts                    # 应用入口文件
│   ├── app.module.ts              # 根模块配置
│   ├── entities/                  # 数据库实体定义
│   ├── modules/                   # 业务模块
│   ├── utils/                     # 工具类
│   ├── types/                     # 类型定义
│   ├── interceptors/              # 拦截器
│   ├── exceptionFilter/           # 异常过滤器
│   └── constants/                 # 常量定义
├── db/                           # 数据库文件
├── logs/                         # 日志文件
└── dist/                         # 构建输出
```

## 核心模块功能

### 1. MainModule (主模块)
- **功能**: 提供项目的基础管理功能
- **主要接口**:
  - `GET /mainProject` - 获取项目信息
  - `POST /mainProject` - 创建项目

### 2. ProjectModule (项目管理模块)
- **功能**: 负责项目的完整生命周期管理
- **主要接口**:
  - `POST /project/open` - 打开项目
  - `POST /project/create` - 创建项目
  - `POST /project/save` - 保存项目
  - `POST /project/delete` - 删除项目
  - `GET /project/unCloseList` - 获取未关闭项目列表
  - `GET /project/projectList` - 获取项目列表

### 3. ShapeModule (图形操作模块)
- **功能**: 处理所有图形相关的操作，包括创建、移动、调整大小、连接等
- **主要接口**:
  - `POST /shape/sidebarDrop` - 从侧边栏拖拽创建图形
  - `GET /shape/diagram/allShape` - 获取图表所有图形
  - `POST /shape/move` - 移动图形
  - `POST /shape/resize` - 调整图形大小
  - `POST /shape/connectShapeAndCreate` - 连接图形并创建
  - `POST /shape/moveEdge` - 移动边线
  - `POST /shape/moveSegment` - 移动线段
  - `POST /shape/updateShapeStyle` - 更新图形样式
  - `POST /shape/clear` - 清空项目
  - `POST /shape/createMindMapRect` - 创建思维导图矩形
  - `POST /shape/saveText` - 保存文本
  - `POST /shape/expandShape` - 展开图形
  - `POST /shape/updateShapeBounds` - 更新图形边界
  - `POST /shape/changeRelationshipEnds` - 改变关系端点
  - `POST /shape/batchUpdateShapeStyle` - 批量更新图形样式

### 4. StepModule (步骤管理模块)
- **功能**: 实现撤销/重做功能，管理操作历史
- **主要接口**:
  - `POST /step/undo` - 撤销操作
  - `POST /step/redo` - 重做操作
  - `GET /step/stepStatus` - 获取步骤状态

### 5. CurrentStepModule (当前步骤模块)
- **功能**: 管理当前步骤状态

### 6. ProjectTemplateModule (项目模板模块)
- **功能**: 管理项目模板，支持导出和导入模板
- **主要接口**:
  - `POST /template/exportTemplate` - 导出模板
  - `POST /template/applyTemplate` - 应用模板
  - `GET /template/list` - 获取模板列表

### 7. SocketModule (WebSocket模块)
- **功能**: 提供实时通信功能，支持多客户端连接和项目订阅
- **主要特性**:
  - 支持多客户端连接
  - 项目级别的消息订阅
  - 实时推送图形变更和步骤操作

## 数据库设计

### 系统级实体 (SystemEntityList)
- `ApplicationProject` - 应用项目
- `ShapeEntity` - 图形实体
- `StepEntity` - 步骤实体
- `CurrentStep` - 当前步骤
- `ProjectTemplate` - 项目模板
- `SnapshotShape` - 快照图形

### 项目级实体 (ProjectEntityList)
- `ShapeEntity` - 图形实体
- `StepEntity` - 步骤实体
- `CurrentStep` - 当前步骤

## 核心工具类

### 1. Transaction 工具
- **文件**: `src/utils/transaction.ts`
- **功能**: 提供数据库事务管理，支持读写分离
- **特性**:
  - 读写连接分离 (WRITE_CONNECTION_NAME / READ_CONNECTION_NAME)
  - 项目级数据库连接管理
  - 自动步骤管理和WebSocket消息推送

### 2. StepManager
- **文件**: `src/utils/StepManager.ts`
- **功能**: 管理操作步骤，支持撤销/重做功能

### 3. ConnectionManager
- **文件**: `src/utils/ConnectionManager.ts`
- **功能**: 管理数据库连接池

### 4. LoggerUtils
- **文件**: `src/utils/LoggerUtils.ts`
- **功能**: 提供统一的日志记录功能

## 关键特性

### 1. 数据库架构
- 使用 SQLite 作为主数据库
- 支持项目级独立数据库
- 读写连接分离，提高并发性能

### 2. 事务管理
- 所有数据库操作都在事务中执行
- 自动步骤记录和WebSocket推送
- 支持项目锁定机制

### 3. 实时通信
- WebSocket 服务器运行在端口 3005
- 支持项目级别的消息订阅
- 实时推送图形变更和操作历史

### 4. 步骤管理
- 完整的撤销/重做功能
- 操作历史记录
- 支持步骤状态查询

### 5. 图形操作
- 丰富的图形操作API
- 支持图形创建、移动、调整大小
- 支持图形连接和关系管理
- 支持样式更新和批量操作

## 启动配置

- **开发模式**: `pnpm run start:dev`
- **调试模式**: `pnpm run start:debug`
- **生产模式**: `pnpm run start:prod`
- **默认端口**: 8003
- **WebSocket端口**: 3005

## 开发注意事项

1. **数据库连接**: 项目使用读写分离的数据库连接策略
2. **事务管理**: 所有业务操作都通过 `transaction` 函数包装
3. **WebSocket**: 实时通信通过 WebSocket 实现，支持多客户端
4. **日志记录**: 使用统一的日志工具记录关键操作
5. **错误处理**: 全局异常过滤器处理所有未捕获的异常

这个服务端项目为 HFDraw 绘图应用提供了完整的后端支持，包括项目管理、图形操作、实时通信等核心功能。