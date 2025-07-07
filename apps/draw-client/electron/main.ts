// 设置控制台编码，解决中文乱码问题
if (process.platform === 'win32') {
  // 设置环境变量
  process.env.LANG = 'zh_CN.UTF-8';
  process.env.LC_ALL = 'zh_CN.UTF-8';
  process.env.LC_CTYPE = 'zh_CN.UTF-8';
  
  // 强制设置控制台编码
  try {
    if (process.stdout && process.stdout.setEncoding) {
      process.stdout.setEncoding('utf8');
    }
    if (process.stderr && process.stderr.setEncoding) {
      process.stderr.setEncoding('utf8');
    }
  } catch (error) {
    console.error('设置控制台编码失败:', error);
  }
  
  // 设置控制台代码页（Windows 特定）
  try {
    const { execSync } = require('child_process');
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch (error) {
    console.error('设置控制台代码页失败:', error);
  }
}

const { app, BrowserWindow } = require('electron');
const AppInstance = require('./AppInstance');
const electronInstance = new AppInstance();

app.whenReady().then(() => {
  electronInstance.start();
  console.log('Electron 内置的 Node.js 版本:', process.versions.node);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      electronInstance.start();
    }
  });
}).catch((error:any) => {
  console.error('Failed to initialize app:', error);
});;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
export {}