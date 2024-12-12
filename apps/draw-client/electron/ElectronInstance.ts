const { globalShortcut, BrowserWindow } = require("electron");
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
    // app.on("ready", this.onReady.bind(this));
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
module.exports = {
  electronInstance,
};
process.on("uncaughtException", (err, origin) => {
  console.error(err);
  console.log(origin);
});
