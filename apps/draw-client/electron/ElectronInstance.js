import { app } from "electron";
import { AppInstance } from './AppInstance.js'
export class ElectronInstance {
    start() {
        this.bindListener()
    }
  bindListener() {
    this.createAppInstance();
    // app.on("ready", this.onReady.bind(this));
  }
  onReady() {
    console.log('BrowserWindow.getAllWindows().length:', BrowserWindow.getAllWindows().length)
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


export const electronInstance = new ElectronInstance();

process.on("uncaughtException", (err, origin) => {
  console.error(err);
  console.log(origin);
});
