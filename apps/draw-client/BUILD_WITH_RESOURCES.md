# 构建脚本使用说明

## 概述

这些脚本用于自动化构建流程，主要功能是：
1. 备份现有的 `release` 目录为 `release1`
2. 执行 `pnpm run build:all` 进行完整构建
3. 将新构建的 `win-unpacked/resources` 内容复制到备份的目录中
4. 删除新生成的 `release` 目录
5. 将备份的目录重命名为 `release`

## 脚本文件

### 1. Node.js 脚本
- **文件**: `build-with-resources.js`
- **运行方式**: `node build-with-resources.js` 或 `pnpm run build:with-resources`
- **依赖**: 需要安装 `fs-extra` 包

### 2. PowerShell 脚本
- **文件**: `build-with-resources.ps1`
- **运行方式**: `.\build-with-resources.ps1`
- **要求**: Windows PowerShell 5.0 或更高版本

### 3. 批处理脚本
- **文件**: `build-with-resources.bat`
- **运行方式**: `build-with-resources.bat`
- **要求**: Windows 系统

## 使用方法

### 方法一：使用 npm 脚本（推荐）
```bash
pnpm run build:with-resources
```

### 方法二：直接运行脚本
```bash
# Node.js 版本
node build-with-resources.js

# PowerShell 版本
.\build-with-resources.ps1

# 批处理版本
build-with-resources.bat
```

## 执行流程

1. **备份阶段**
   - 检查 `release` 目录是否存在
   - 如果存在，重命名为 `release1`
   - 如果不存在，跳过此步骤

2. **构建阶段**
   - 执行 `pnpm run build:all`
   - 等待构建完成

3. **资源复制阶段**
   - 检查新构建的 `win-unpacked/resources` 目录
   - 将内容复制到 `release1/win-unpacked/resources`
   - 如果目标目录已存在，先删除再复制

4. **清理阶段**
   - 删除新生成的 `release` 目录
   - 将 `release1` 重命名为 `release`

## 错误处理

- 所有脚本都包含完整的错误处理
- 如果任何步骤失败，脚本会停止执行并显示错误信息
- 错误信息包含具体的失败原因和位置

## 注意事项

1. **权限要求**: 确保有足够的文件系统权限来重命名和删除目录
2. **磁盘空间**: 确保有足够的磁盘空间来存储备份和构建文件
3. **依赖检查**: 确保所有必要的依赖都已安装
4. **路径安全**: 脚本使用相对路径，确保在正确的目录中运行

## 故障排除

### 常见问题

1. **权限错误**
   - 以管理员身份运行脚本
   - 检查文件和目录的访问权限

2. **路径错误**
   - 确保在 `apps/draw-client` 目录中运行脚本
   - 检查目录结构是否正确

3. **构建失败**
   - 检查 `pnpm run build:all` 是否能正常执行
   - 查看构建日志获取详细错误信息

4. **复制失败**
   - 检查源目录和目标目录是否存在
   - 确保有足够的磁盘空间

## 日志输出

脚本会输出详细的执行日志，包括：
- 🚀 开始执行
- 📁 目录操作
- 🔨 构建过程
- 📋 复制操作
- 🗑️ 清理操作
- ✅ 成功完成
- ❌ 错误信息

## 自定义

如果需要修改脚本行为，可以编辑相应的脚本文件：
- 修改路径变量
- 调整复制逻辑
- 添加额外的验证步骤
- 自定义错误处理 