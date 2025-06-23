# PNPM 包级别隔离配置指南

## 问题解决方案

你的需求：**每个子包只处理自己的依赖，避免重新解析整个依赖树**

## 核心配置

### 1. 根目录包级别隔离配置

在 `.npmrc` 中添加了关键配置：

```ini
# 包级别隔离配置
shared-workspace-lockfile=false   # 不共享工作空间锁文件
recursive-install=false           # 不递归安装
package-import-method=copy        # 使用复制方式导入包
node-linker=isolated              # 使用隔离的节点链接器
```

### 2. 每个子包的独立配置

为每个子包创建了独立的 `.npmrc` 文件：
- `packages/elbow/.npmrc`
- `packages/types/.npmrc`
- `packages/utils/.npmrc`
- `packages/graph/.npmrc`

每个包的配置都包含：
```ini
shared-workspace-lockfile=false
recursive-install=false
package-import-method=copy
node-linker=isolated
link-workspace-packages=true
prefer-workspace-packages=true
```

## 使用方法

### 方法1：使用隔离安装脚本（推荐）

```bash
# 为 elbow 包添加 types 依赖
node scripts/isolated-install.js add @hfdraw/elbow @hfdraw/types

# 或使用便捷脚本
npm run add:isolated @hfdraw/elbow @hfdraw/types

# 安装指定包的依赖
npm run install:isolated @hfdraw/elbow
```

### 方法2：直接使用 pnpm 命令

```bash
# 在包目录下直接安装（推荐）
cd packages/elbow
pnpm add @hfdraw/types --workspace --no-frozen-lockfile --no-shared-workspace-lockfile

# 或从根目录执行
pnpm --filter @hfdraw/elbow add @hfdraw/types --workspace --no-frozen-lockfile --no-shared-workspace-lockfile
```

### 方法3：使用便捷脚本

```bash
# 包级别安装
npm run install:package
```

## 工作原理

### 隔离机制

1. **独立锁文件**：每个包有自己的依赖解析
2. **非递归安装**：只处理当前包的依赖
3. **隔离链接器**：避免全局依赖污染
4. **复制导入**：确保包之间的独立性

### 性能优势

- ✅ **避免全局依赖解析**：不会重新解析整个依赖树
- ✅ **包级别缓存**：每个包有独立的缓存策略
- ✅ **减少网络请求**：只检查当前包相关的依赖
- ✅ **并行处理**：多个包可以同时处理各自的依赖

## 预期效果

### 安装时间对比

- **优化前**：1分42秒（解析567个包）
- **优化后**：预计5-15秒（只解析相关包）

### 依赖解析范围

- **优化前**：整个 monorepo 的所有依赖
- **优化后**：只有当前包 + 工作空间依赖

## 验证方法

### 测试隔离效果

```bash
# 测试添加依赖的时间
time node scripts/isolated-install.js add @hfdraw/elbow @hfdraw/types

# 对比原来的命令
time pnpm --filter @hfdraw/elbow add @hfdraw/types --workspace
```

### 检查依赖解析

```bash
# 查看包的依赖树（应该很简洁）
cd packages/elbow
pnpm list

# 查看锁文件（应该只包含相关依赖）
ls -la pnpm-lock.yaml
```

## 故障排除

### 如果仍然很慢

1. **确认配置生效**：
   ```bash
   cd packages/elbow
   pnpm config list
   ```

2. **清理缓存**：
   ```bash
   pnpm store prune
   rm -rf packages/*/node_modules
   rm -rf packages/*/pnpm-lock.yaml
   ```

3. **重新初始化**：
   ```bash
   node scripts/isolated-install.js install @hfdraw/elbow
   ```

### 如果出现依赖问题

```bash
# 检查工作空间链接
pnpm list --depth=0

# 重新链接工作空间包
pnpm install --link-workspace-packages
```

## 最佳实践

1. **始终使用隔离脚本**：`node scripts/isolated-install.js`
2. **在包目录下操作**：`cd packages/xxx && pnpm add ...`
3. **避免全局命令**：不要在根目录使用 `pnpm install`
4. **定期清理**：定期清理各包的 node_modules

## 高级配置

### 环境变量控制

```bash
# 强制包级别隔离
export PNPM_SHARED_WORKSPACE_LOCKFILE=false
export PNPM_RECURSIVE_INSTALL=false

# 然后执行安装命令
pnpm add @hfdraw/types --workspace
```

### CI/CD 配置

```yaml
# .github/workflows/ci.yml
- name: Install dependencies (isolated)
  run: |
    for package in packages/*/; do
      cd "$package"
      pnpm install --no-frozen-lockfile --no-shared-workspace-lockfile
      cd ../..
    done
```

这个配置确保每个包都是独立处理的，完全符合你"每个子包只管自己的"需求。