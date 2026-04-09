#!/usr/bin/env node

/**
 * 包级别隔离安装脚本
 * 让每个子包只处理自己的依赖，避免重新解析整个依赖树
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[包隔离安装] ${message}`);
}

function executeCommand(command, description, cwd = process.cwd()) {
  log(description);
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd,
      env: {
        ...process.env,
        // 强制使用包级别配置
        PNPM_SHARED_WORKSPACE_LOCKFILE: 'false',
        PNPM_RECURSIVE_INSTALL: 'false'
      }
    });
    log(`✅ ${description} 完成`);
    return result;
  } catch (error) {
    log(`❌ ${description} 失败: ${error.message}`);
    throw error;
  }
}

function addWorkspaceDependency(packageName, dependency) {
  log(`为 ${packageName} 添加依赖 ${dependency}`);
  
  const packagePath = getPackagePath(packageName);
  if (!packagePath) {
    throw new Error(`找不到包: ${packageName}`);
  }
  
  // 使用包级别安装，避免全局依赖解析
  const command = `pnpm add ${dependency} --workspace --no-frozen-lockfile --no-shared-workspace-lockfile`;
  executeCommand(command, `在 ${packageName} 中添加 ${dependency}`, packagePath);
}

function getPackagePath(packageName) {
  const possiblePaths = [
    path.join(process.cwd(), 'packages', packageName.replace('@hfdraw/', '')),
    path.join(process.cwd(), 'apps', packageName),
    path.join(process.cwd(), 'services')
  ];
  
  for (const packagePath of possiblePaths) {
    if (fs.existsSync(path.join(packagePath, 'package.json'))) {
      return packagePath;
    }
  }
  
  return null;
}

function installPackageDependencies(packageName) {
  log(`安装 ${packageName} 的依赖`);
  
  const packagePath = getPackagePath(packageName);
  if (!packagePath) {
    throw new Error(`找不到包: ${packageName}`);
  }
  
  // 只安装当前包的依赖
  const command = 'pnpm install --no-frozen-lockfile --no-shared-workspace-lockfile';
  executeCommand(command, `安装 ${packageName} 依赖`, packagePath);
}

function showUsage() {
  console.log(`
包级别隔离安装工具

使用方法：
  # 为指定包添加工作空间依赖
  node scripts/isolated-install.js add <package-name> <dependency>
  
  # 安装指定包的依赖
  node scripts/isolated-install.js install <package-name>
  
  # 显示帮助
  node scripts/isolated-install.js --help

示例：
  # 为 elbow 包添加 types 依赖
  node scripts/isolated-install.js add @hfdraw/elbow @hfdraw/types
  
  # 安装 elbow 包的所有依赖
  node scripts/isolated-install.js install @hfdraw/elbow

优势：
  ✅ 只处理指定包的依赖
  ✅ 避免重新解析整个依赖树
  ✅ 更快的安装速度
  ✅ 包级别隔离
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'add':
        if (args.length < 3) {
          log('❌ 缺少参数: node scripts/isolated-install.js add <package-name> <dependency>');
          process.exit(1);
        }
        addWorkspaceDependency(args[1], args[2]);
        break;
        
      case 'install':
        if (args.length < 2) {
          log('❌ 缺少参数: node scripts/isolated-install.js install <package-name>');
          process.exit(1);
        }
        installPackageDependencies(args[1]);
        break;
        
      default:
        log(`❌ 未知命令: ${command}`);
        showUsage();
        process.exit(1);
    }
    
    log('🎉 操作完成！');
  } catch (error) {
    log(`❌ 操作失败: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  addWorkspaceDependency,
  installPackageDependencies,
  getPackagePath
};