import { globalShortcut, BrowserWindow, dialog, ipcMain, app } from "electron";
const { AppInstance } = require("./AppInstance");
class ElectronInstance {
  appInstance: any
  start() {
    this.bindListener();
  }
 
  bindListener() {
    this.createAppInstance();
    this.setupIpcHandlers();
    // app.on("ready", this.onReady.bind(this));
  }

  setupIpcHandlers() {
    ipcMain.handle('open-file-dialog', async () => {
      console.log('open-file-dialog');
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
    ipcMain.handle('close-project', () => {
      app.quit();
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
