# Electron 应用构建指南

## 项目结构说明

本项目是一个 monorepo 结构，包含以下主要部分：
- `apps/draw-client`: Electron 客户端应用
- `services`: NestJS 后端服务
- `packages`: 共享的工具包和类型定义

## 构建流程

### 1. 开发环境运行

```bash
# 在 draw-client 目录下
pnpm run dev
```

开发环境下，Electron 应用不会启动内置的 Node 服务，需要单独启动后端服务：

```bash
# 在 services 目录下
pnpm run start:dev
```

### 2. 生产环境构建

```bash
# 在 draw-client 目录下
pnpm run build:all
```

这个命令会依次执行：
1. `build-ts`: 编译 TypeScript 文件
2. `build:server`: 构建并打包 NestJS 服务
3. `vite build`: 构建前端应用
4. `electron:build`: 打包 Electron 应用
5. "build-ts": "tsc",: 编译 electron 目录相关代码，vue.config.js打包时的入口文件

### 3. 服务端代码打包说明

#### 构建过程

1. **NestJS 构建**: 使用 `nest build` 编译 TypeScript 代码，保持模块结构
2. **文件复制**: 将编译后的 JavaScript 文件复制到 `nodeServer` 目录
3. **依赖优化**: 创建简化的 `package.json`，只包含生产环境必需的依赖
4. **资源复制**: 复制数据库文件等运行时需要的资源

#### 为什么不使用 Webpack 打包？

虽然项目中包含了 webpack 配置，但在 Electron 环境中我们选择使用 `nest build` 而不是 webpack 打包，原因如下：

1. **依赖兼容性**: Webpack 打包可能导致某些 Node.js 原生模块（如 better-sqlite3）无法正常工作
2. **调试友好**: 保持模块结构使得错误堆栈更清晰，便于调试
3. **构建速度**: `nest build` 比 webpack 打包更快
4. **文件大小**: 虽然 webpack 能生成单个文件，但在 Electron 环境中文件大小不是主要考虑因素
5. **维护简单**: 减少了 webpack 配置的复杂性和潜在问题

#### 目录结构

打包后的 Electron 应用结构：
```
会飞绘图.exe
├── resources/
│   └── app.asar (或 app/ 目录)
│       ├── dist/           # 前端构建文件
│       ├── dist-electron/  # Electron 主进程文件
│       ├── nodeServer/     # 后端服务文件
│       │   ├── main.js     # 打包后的服务入口
│       │   └── package.json
│       └── package.json
```

### 4. 运行时行为

当用户双击 `会飞绘图.exe` 时：

1. Electron 主进程启动
2. 检测到非开发环境，自动启动内置的 Node 服务
3. 使用 `child_process.fork` 启动 `nodeServer/main.js`
4. 服务在端口 8003 上启动
5. 前端页面加载并连接到本地服务

### 5. 日志和调试

应用运行时会在用户数据目录下创建日志文件：
- Windows: `%APPDATA%/draw-client/logs/`
- 日志文件格式: `hfdraw.YYYY-MM-DD_HH-mm-ss.log`

日志包含：
- 应用启动信息
- 服务启动状态
- 错误信息和堆栈跟踪

### 6. 常见问题

#### 服务启动失败

如果遇到 "spawn ENOENT" 错误：
1. 检查 `nodeServer/main.js` 文件是否存在
2. 检查文件路径是否正确
3. 查看日志文件获取详细错误信息

#### 依赖问题

如果遇到模块找不到的错误：
1. 确保 webpack 配置正确打包了所有依赖
2. 检查 `externals` 配置是否排除了不应该排除的模块
3. 对于 native 模块（如 better-sqlite3），确保已正确重建

### 7. 开发建议

1. **模块化**: 保持前端和后端代码的清晰分离
2. **共享代码**: 使用 packages 目录存放共享的类型定义和工具函数
3. **错误处理**: 在服务启动过程中添加充分的错误处理和日志记录
4. **测试**: 在不同环境下测试打包后的应用

## 构建命令参考

```bash
# 只构建前端
pnpm run build

# 只构建服务端
pnpm run build:server

# 只构建 Electron 应用（需要先构建前端和服务端）
pnpm run electron:build

# 完整构建流程
pnpm run build:all

# 重建 native 模块
pnpm run rebuild
```