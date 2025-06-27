const { resolve } = require("path");
const { app, Menu, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const fork = require("child_process").fork;
const dayjs = require("dayjs");
const isDevelopment = process.env.NODE_ENV === 'development'
const preloadFile = resolve(__dirname, './preload/index.js')
console.log("preloadFile------:", preloadFile);

class Logger {
  private logPath: string;
  private options: { flags: string; encoding: string };

  constructor() {
    const userDataPath = app.getPath("userData");
    const logDir = resolve(userDataPath, "./logs");
    
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logPath = resolve(
      logDir,
      `hfdraw.${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.log`
    );

    this.options = {
      flags: "a", // append模式
      encoding: "utf8", // utf8编码
    };

    console.log("日志文件路径:", this.logPath);
  }

  private async writeLog(content: string, type: 'info' | 'error' = 'info') {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const logContent = `[${timestamp}][${type.toUpperCase()}] ${content}\n`;

    return new Promise<void>((resolve, reject) => {
      fs.appendFile(this.logPath, logContent, this.options, (err) => {
        if (err) {
          console.error("写入日志失败:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async info(content: string) {
    await this.writeLog(content, 'info');
  }

  async error(error: Error | string) {
    const errorContent = error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack || ''}`
      : error;
    await this.writeLog(errorContent, 'error');
  }
}

class AppInstance {
  mainWindow: any;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }
  async start() {
    await this.logger.info(`appInstance start`);
    if (!isDevelopment) {
      await this.startNodeServer();
    }
    await this.createMainWindow();
    this.setupIPC();
  }
  async startNodeServer() {
    // 在打包后的环境中，nodeServer 目录位于应用根目录下
    const appPath = app.getAppPath();
    const nodeScript = resolve(appPath, "../../nodeServer/main.js");
    await this.logger.info(`启动服务器脚本: ${nodeScript}`);
    await this.logger.info(`应用路径: ${appPath}`);

    const subProcess = fork(
      nodeScript,
      ["--prod", "--appPath", app.getAppPath()],
      {
        cwd: resolve(nodeScript, ".."),
        stdio: "pipe",
      }
    );

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
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
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

    if (process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      const localPath = resolve(__dirname, '../dist/index.html');
      this.mainWindow.loadURL(`file://${localPath}`);
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

    console.log("setupIPC - IPC事件监听器注册完成");
  }
}

module.exports = AppInstance;