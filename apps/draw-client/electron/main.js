import { app, BrowserWindow } from 'electron';
import { join } from 'path';

const getPath = (...args) => {
  return join(new URL('.', import.meta.url).pathname, ...args);
}
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPath('./preload/index.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  console.log('process.env.VITE_DEV_SERVER_URL:', process.env.VITE_DEV_SERVER_URL)
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(getPath('../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});