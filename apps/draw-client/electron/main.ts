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