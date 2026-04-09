const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 开始执行构建流程...');

async function buildWithResources() {
  try {
    const currentDir = process.cwd();
    const releaseDir = path.join(currentDir, 'release');
    const release1Dir = path.join(currentDir, 'release1');
    const winUnpackedDir = path.join(currentDir, 'release', 'win-unpacked');
    const resourcesDir = path.join(winUnpackedDir, 'resources');

    // 1. 检查 release 目录是否存在，如果存在则重命名为 release1
    if (fs.existsSync(releaseDir)) {
      console.log('📁 将 release 目录重命名为 release1...');
      await fs.move(releaseDir, release1Dir);
      console.log('✅ release 目录已重命名为 release1');
    } else {
      console.log('ℹ️  release 目录不存在，跳过重命名步骤');
    }

    // 2. 执行 pnpm run build:all
    console.log('🔨 开始执行 pnpm run build:all...');
    execSync('pnpm run build:all', { 
      stdio: 'inherit',
      cwd: currentDir 
    });
    console.log('✅ pnpm run build:all 执行完成');

    // 3. 检查 win-unpacked/resources 目录是否存在
    if (!fs.existsSync(resourcesDir)) {
      throw new Error(`❌ win-unpacked/resources 目录不存在: ${resourcesDir}`);
    }

    // 4. 检查 release1 目录是否存在
    if (!fs.existsSync(release1Dir)) {
      throw new Error(`❌ release1 目录不存在: ${release1Dir}`);
    }

    // 5. 将 win-unpacked/resources 的内容复制到 release1 对应目录
    console.log('📋 复制 resources 内容到 release1...');
    
    // 查找 release1 中的 win-unpacked 目录
    const release1WinUnpackedDir = path.join(release1Dir, 'win-unpacked');
    if (fs.existsSync(release1WinUnpackedDir)) {
      const release1ResourcesDir = path.join(release1WinUnpackedDir, 'resources');
      
      // 如果 release1 中已有 resources 目录，先删除
      if (fs.existsSync(release1ResourcesDir)) {
        console.log('🗑️  删除 release1 中现有的 resources 目录...');
        await fs.remove(release1ResourcesDir);
      }
      
      // 复制新的 resources 目录
      console.log('📋 复制 resources 目录...');
      await fs.copy(resourcesDir, release1ResourcesDir);
      console.log('✅ resources 目录复制完成');
    } else {
      console.log('⚠️  release1 中没有找到 win-unpacked 目录，跳过复制');
    }

    // 6. 删除新生成的 release 目录
    if (fs.existsSync(releaseDir)) {
      console.log('🗑️  删除新生成的 release 目录...');
      await fs.remove(releaseDir);
      console.log('✅ release 目录已删除');
    }

    // 7. 将 release1 重命名为 release
    console.log('📁 将 release1 重命名为 release...');
    await fs.move(release1Dir, releaseDir);
    console.log('✅ release1 已重命名为 release');

    console.log('🎉 构建流程完成！');
    console.log(`📂 最终输出目录: ${releaseDir}`);

  } catch (error) {
    console.error('❌ 构建流程失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 执行构建流程
buildWithResources(); 