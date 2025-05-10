const { globalShortcut, BrowserWindow, dialog, ipcMain } = require("electron");
const { AppInstance } = require("./AppInstance");
class ElectronInstance {
  appInstance: any
  start() {
    this.initShortcut();
    this.bindListener();
  }
  initShortcut() {
    // 注册全局快捷键
    const ret = globalShortcut.register("CommandOrControl+Shift+I", () => {
      // 获取当前活动的窗口
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.webContents.openDevTools();
      } else {
        console.log("没有找到活动窗口");
      }
    });

    if (!ret) {
      console.log("该快捷键已被占用");
    }
  }
  bindListener() {
    this.createAppInstance();
    this.setupIpcHandlers();
    // app.on("ready", this.onReady.bind(this));
  }

  setupIpcHandlers() {
    ipcMain.handle('open-file-dialog', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Draw Files', extensions: ['draw'] }]
      });

      if (result.canceled) {
        console.log('File selection was canceled');
        return [];
      }

      if (result.filePaths.length === 0) {
        console.log('No file selected');
        return [];
      }

      return result.filePaths;
    });
  }
  onReady() {
    console.log(
      "BrowserWindow.getAllWindows().length:",
      BrowserWindow.getAllWindows().length
    );
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createAppInstance();
    }
  }

  createAppInstance() {
    const appInstance = new AppInstance();
    this.appInstance = appInstance;
    appInstance.start();
    return appInstance;
  }
}

const electronInstance = new ElectronInstance();
process.on("uncaughtException", (err, origin) => {
  console.error(err);
  console.log(origin);
});
