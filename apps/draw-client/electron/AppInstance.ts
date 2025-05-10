const { resolve } = require("path");
const { app, Menu, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const fork = require("child_process").fork;
const dayjs = require("dayjs");
const isDevelopment = process.env.NODE_ENV === 'development'
const preloadFile = resolve(__dirname, './preload/index.js')
console.log("preloadFile------:", preloadFile);
class AppInstance {
  mainWindow: any;

  async start() {
    if (!isDevelopment) {
      await this.startNodeServer();
    }
    await this.createMainWindow();
    this.setupIPC();
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
  async startNodeServer() {
    const nodeScript = resolve(__dirname, isDevelopment ? "../public/nodeServer/main.js" : "../dist/nodeServer/main.js");
    console.log("nodeScript:", nodeScript);
    const subProcess = fork(
      nodeScript,
      ["--prod", "--appPath", app.getAppPath()],
      {
        cwd: resolve(nodeScript, ".."),
        stdio: "pipe",
      }
    );
    // C:\Users\admin\AppData\Roaming\draw-client
    const { logPath } = this.createLogger();
    console.log("-------------");
    subProcess.stdout &&
      subProcess.stdout.on("data", (str) => {
        console.log("subProcess:", str.toString());
        fs.appendFile(
          logPath,
          dayjs().format("YYYY-MM-DD HH:mm:ss") + " " + str.toString(),
          { flag: "a" },
          (err) => {
            err && console.error(err);
          }
        );
      });
    subProcess.stderr &&
      subProcess.stderr.on("data", (err) => {
        console.error("node error:", err.toString());

        fs.appendFile(
          logPath,
          dayjs().format("YYYY-MM-DD HH:mm:ss") +
            " " +
            err.name +
            err.message +
            (err.stack && err.stack.toString()),
          { flag: "a" },
          (err1) => {
            err1 && console.error(err1);
          }
        );
      });
    console.log("await service ready");
  }
  createLogger() {
    const userDataPath = app.getPath("userData");
    const logDir = resolve(userDataPath, "./logs");
    let options = {
      flags: "a", // append模式
      encoding: "utf8", // utf8编码
    };
    console.log("logDir:", logDir);
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = resolve(
      logDir,
      "hfdraw." + dayjs().format("YYYY-MM-DD_HH-mm-ss") + ".log"
    );
    console.log("logPath:", logPath);
    return {
      logPath,
    };
  }
}

module.exports = AppInstance;