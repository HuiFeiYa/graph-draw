const { app, BrowserWindow } = require('electron');
const {electronInstance} = require("./ElectronInstance.js");

app.whenReady().then(() => {
  electronInstance.start();
  console.log('Electron 内置的 Node.js 版本:', process.versions.node);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      electronInstance.start();
    }
  });
}).catch((error) => {
  console.error('Failed to initialize app:', error);
});;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});