const { spawn } = require('child_process');
const path = require('path');

console.log('开始测试服务启动...');

// 启动服务
const child = spawn('node', ['dist/src/main.js'], {
  cwd: path.resolve(__dirname),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

// 监听标准输出
child.stdout.on('data', (data) => {
  console.log(`[STDOUT] ${data.toString()}`);
});

// 监听标准错误
child.stderr.on('data', (data) => {
  console.error(`[STDERR] ${data.toString()}`);
});

// 监听进程退出
child.on('close', (code) => {
  console.log(`服务进程退出，退出码: ${code}`);
});

// 监听进程错误
child.on('error', (error) => {
  console.error(`启动服务失败: ${error.message}`);
});

// 5秒后检查日志文件
setTimeout(() => {
  const fs = require('fs');
  const logsDir = path.resolve(__dirname, 'dist/logs');
  
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir);
    console.log('日志文件列表:', files);
    
    files.forEach(file => {
      if (file.endsWith('.log')) {
        const logPath = path.join(logsDir, file);
        const content = fs.readFileSync(logPath, 'utf8');
        console.log(`\n=== ${file} 内容 ===`);
        console.log(content);
      }
    });
  } else {
    console.log('日志目录不存在');
  }
  
  // 终止进程
  child.kill();
}, 10000); 