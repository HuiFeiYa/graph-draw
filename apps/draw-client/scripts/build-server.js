const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function buildServer() {
  console.log('开始构建服务端代码...');
  
  try {
    const servicesDir = path.resolve(__dirname, '../../../services');
    const targetDir = path.resolve(__dirname, '../nodeServer');
    
    // 1. 构建 NestJS 服务（使用 nest build，保持模块结构）
    console.log('1. 构建 NestJS 服务...');
    execSync('pnpm run build', { 
      cwd: servicesDir,
      stdio: 'inherit' 
    });
    
    // 2. 清理目标目录
    console.log('2. 清理目标目录:', targetDir);
    await fs.remove(targetDir);
    
    // 3. 复制编译后的 JavaScript 文件
    console.log('3. 复制编译后的文件...');
    const sourceDistDir = path.resolve(servicesDir, 'dist');
    await fs.copy(sourceDistDir, targetDir);
    
    // 4. 复制必要的配置文件
    console.log('4. 复制配置文件...');
    const filesToCopy = [
      'package.json',
      // 如果有其他配置文件需要复制，可以在这里添加
    ];
    
    for (const file of filesToCopy) {
      const sourcePath = path.resolve(servicesDir, file);
      const targetPath = path.resolve(targetDir, file);
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }
    
    // 5. 创建生产环境的 package.json
    console.log('5. 创建生产环境的 package.json...');
    const originalPackage = await fs.readJson(path.resolve(servicesDir, 'package.json'));
    
    // 过滤出生产依赖，排除开发工具
    const productionDependencies = {};
    const excludePatterns = [
      '@nestjs/cli',
      '@nestjs/schematics', 
      '@nestjs/testing',
      '@types/',
      'eslint',
      'prettier',
      'jest',
      'supertest',
      'ts-',
      'typescript',
      'webpack',
      'fork-ts-checker-webpack-plugin'
    ];
    
    Object.entries(originalPackage.dependencies || {}).forEach(([name, version]) => {
      const shouldExclude = excludePatterns.some(pattern => name.includes(pattern));
      if (!shouldExclude) {
        productionDependencies[name] = version;
      }
    });
    
    const simplifiedPackage = {
      name: originalPackage.name,
      version: originalPackage.version,
      description: originalPackage.description,
      main: 'main.js',
      dependencies: productionDependencies,
      // 添加启动脚本
      scripts: {
        start: 'node main.js'
      }
    };
    
    await fs.writeJson(path.resolve(targetDir, 'package.json'), simplifiedPackage, { spaces: 2 });
    
    // 6. 复制数据库目录（如果存在）
    const dbSourceDir = path.resolve(servicesDir, 'db');
    if (await fs.pathExists(dbSourceDir)) {
      console.log('6. 复制数据库目录...');
      const dbTargetDir = path.resolve(targetDir, 'db');
      await fs.copy(dbSourceDir, dbTargetDir);
    }
    
    console.log('服务端代码构建完成！');
    console.log('构建输出目录:', targetDir);
    
  } catch (error) {
    console.error('构建服务端代码失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildServer();
}

module.exports = buildServer;