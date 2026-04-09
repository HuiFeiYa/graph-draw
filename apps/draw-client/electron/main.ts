
const { app, BrowserWindow } = require('electron');
const AppInstance = require('./AppInstance');
const electronInstance = new AppInstance();
const Logger = require('./Logger');
const logger = new Logger();
const { exec } = require('child_process');
exec('chcp 65001', (err) => { err && console.log('chcp error: ' + err); });
logger.info(`main start------`)
app.whenReady().then(() => {
  logger.info(`whenReady`)
  logger.info('Electron 内置的 Node.js 版本:'+ process.versions.node)
  electronInstance.start();
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