const { resolve } = require("path");
const { app, Menu, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const fork = require("child_process").fork;
const isDevelopment = process.env.NODE_ENV !== 'production'
console.log('process.env.NODE_ENV:',process.env.NODE_ENV)
// 根据环境确定 preload 文件路径
const preloadFile = isDevelopment 
  ? resolve(__dirname, './preload/index.js') // 开发环境：Vite 处理后的文件
  : resolve(__dirname, './preload/index.js'); // 生产环境：编译后的文件
console.log("preloadFile------:", preloadFile);
console.log('Electron Node.js 版本:', process.versions.node);
console.log('Electron 使用的 NODE_MODULE_VERSION:', process.versions.modules); // 关键！这个值必须和原生模块匹配

import { Logger } from './Logger';

class AppInstance {
  mainWindow: any;
  private logger: Logger;
  private nodeServerProcess: any = null; // 保存 node server 进程引用

  constructor() {
    this.logger = new Logger();
  }
  
  async start() {
    // 关闭窗口时，会再次执行，此时环境变量是 undefined 则不在执行后续代码
    if (!process.env.NODE_ENV) {
      app.quit();
      return 
    }
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
    
    await this.logger.info(`appInstance start`);
    console.log('isDevelopment:',isDevelopment)
    // 移除自动启动 node server 的逻辑
    if(!isDevelopment){
      await this.startNodeServer();
    }
    await this.createMainWindow();
    this.setupIPC();
  }
  
  async startNodeServer() {
    // 如果已经启动了 node server，先杀掉再重启
    if (this.nodeServerProcess) {
      console.log('检测到已有 Node server 进程，准备重启...');
      await this.logger.info('检测到已有 Node server 进程，准备重启...');
      try {
        this.nodeServerProcess.kill();
        await this.logger.info('已发送 kill 信号给 Node server 进程，等待退出...');
        // 等待进程退出
        await new Promise<void>((resolve) => {
          this.nodeServerProcess.once('close', (code, signal) => {
            console.log(`旧 Node server 进程已退出，退出码: ${code}，信号: ${signal}`);
            this.logger.info(`旧 Node server 进程已退出，退出码: ${code}，信号: ${signal}`);
            resolve();
          });
        });
      } catch (e) {
        console.error('杀死旧 Node server 进程时出错:', e);
        await this.logger.error(`杀死旧 Node server 进程时出错: ${e.message}`);
      }
      this.nodeServerProcess = null;
    }

    try {
      // 在打包后的环境中，nodeServer 目录位于应用根目录下
      const appPath = app.getAppPath();
      const nodeScript = isDevelopment ? resolve(appPath, "./nodeServer/dist/main.js") : resolve(appPath, "../../nodeServer/dist/main.js");
      console.log('nodeScript:', nodeScript)
      console.log('appPath:',appPath)
      await this.logger.info(`启动服务器脚本: ${nodeScript}`);
      await this.logger.info(`应用路径: ${appPath}`);

      const subProcess = fork(
        nodeScript,
        {
          cwd: isDevelopment ? resolve(appPath,'./nodeServer/dist') : resolve(appPath,'../../nodeServer'),
          env: {
            ...process.env,
            NODE_PATH: isDevelopment? resolve(appPath,'./nodeServer/node_modules'): resolve(appPath,'../../nodeServer/node_modules'),
            ELECTRON_RUN_AS_NODE: '1',
            // 设置编码环境变量
            LANG: 'zh_CN.UTF-8',
            LC_ALL: 'zh_CN.UTF-8',
            LC_CTYPE: 'zh_CN.UTF-8',
            NODE_OPTIONS: '--max-old-space-size=4096'
          },
          stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        }
      );
      
      this.nodeServerProcess = subProcess; // 保存进程引用
      await this.logger.info(`subProcess fork`);

      // 子进程启动失败（如路径错误、权限问题等）
      subProcess.on('error', (err) => {
          console.error('子进程启动错误:', err);
          this.logger.error(`子进程启动错误: ${err.message}`);
          this.nodeServerProcess = null; // 清除进程引用
      });
      
      // 子进程退出
      subProcess.on('close', (code, signal) => {
          console.log(`子进程退出，退出码: ${code}，信号: ${signal}`);
          this.logger.info(`子进程退出，退出码: ${code}，信号: ${signal}`);
          this.nodeServerProcess = null; // 清除进程引用
      });

      subProcess.stdout?.on("data", async (data) => {
        const message = data.toString();
        console.log("subProcess:", message);
        await this.logger.info(`服务输出: ${message}`);
      });

      subProcess.stderr?.on("data", async (data) => {
        const error = data.toString();
        console.error("node error:", error);
        await this.logger.error(`服务错误: ${error}`);
      });

      await this.logger.info("等待服务就绪...");
      return { success: false, message: 'Node server 启动成功' };
    } catch (error) {
      await this.logger.error(`启动 Node server 失败: ${error.message}`);
      return { success: false, message: `启动失败: ${error.message}` };
    }
  }

  async stopNodeServer() {
    if (this.nodeServerProcess) {
      this.nodeServerProcess.kill();
      this.nodeServerProcess = null;
      await this.logger.info("Node server 已停止");
      return { success: false, message: 'Node server 已停止' };
    }
    return { success: false, message: 'Node server 未运行' };
  }

  async createMainWindow() {
    await this.logger.info(`preloadFile: ${preloadFile}`);
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 800, 
      minHeight: 600,
      minWidth: 975,
      frame: false,
      webPreferences: {
        preload: preloadFile,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
      title: "HfDraw",
      type: "normal"
    });
    Menu.setApplicationMenu(null);
    console.log('process.env.VITE_DEV_SERVER_URL:',process.env.VITE_DEV_SERVER_URL);
    await this.logger.info(`process.env.VITE_DEV_SERVER_URL: ${process.env.VITE_DEV_SERVER_URL}`);
    if (process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      const localPath = resolve(__dirname, '../dist-app/index.html');
      console.log('localPath:', localPath);  
      await this.logger.info(`localPath: ${localPath}`);
      await this.mainWindow.loadURL(localPath);
    }
  }

  setupIPC() {
    console.log("setupIPC - 开始注册IPC事件监听器");
    

    ipcMain.on('open-dev-tools', () => {
      console.log('收到open-dev-tools事件');
      if (this.mainWindow) {
        console.log('正在打开开发者工具...');
        this.mainWindow.webContents.openDevTools();
      } else {
        console.log('mainWindow未初始化');
      }
    });

    ipcMain.handle('open-file-dialog', async (event) => {
        // 这里编写打开文件对话框的逻辑，比如使用electron的dialog模块
        const { dialog } = require('electron');
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });
        return result.filePaths[0]; // 返回选择的文件路径，可按需调整返回值
    });

    ipcMain.handle('window-minimize', () => {
      if (this.mainWindow) this.mainWindow.minimize();
    });
    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow) this.mainWindow.maximize();
    });
    ipcMain.handle('window-unmaximize', () => {
      if (this.mainWindow) this.mainWindow.unmaximize();
    });
    ipcMain.handle('window-close', async () => {
      console.log('开始关闭窗口，检查 mainWindow 状态');
      if (this.mainWindow) {
        console.log('执行 mainWindow.close()');
        this.mainWindow.close();
        // 额外检查：是否有残留子进程
        console.log('Node server 进程状态:', this.nodeServerProcess ? '存在' : '已销毁');
        // 如果有，手动杀死
        if (this.nodeServerProcess) {
          this.nodeServerProcess.kill();
          console.log('已尝试杀死 Node server 进程');
        }
      }
      console.log('窗口关闭逻辑执行完毕');
    });

    console.log("setupIPC - IPC事件监听器注册完成");
  }
}
process.on('uncaughtException', (err) => {
  console.error('主进程未捕获异常:', err);
  // 可选：记录日志到文件
  // fs.writeFileSync('crash.log', err.stack);
  // 强制退出，避免异常重启
  app.quit();
});
module.exports = AppInstance;