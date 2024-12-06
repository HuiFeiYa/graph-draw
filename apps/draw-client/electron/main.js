const { app, BrowserWindow, session, Menu } = require('electron');
const path = require('path');
const {electronInstance} = require("./ElectronInstance.js");

const getPath = (...args) => {
  // return join(new URL('.', import.meta.url).pathname, ...args);
  return path.join(__dirname, ...args);
}
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPath('./preload/index.js'),
      nodeIntegration: false, // 禁用 Node 集成
      contextIsolation: true, // 启用上下文隔离
       sandbox: true,
    },
  });
  // 隐藏菜单栏
  Menu.setApplicationMenu(null)
  const localPath = getPath('../dist/index.html');
  // process.env.VITE_DEV_SERVER_URL = ''
  console.log('process.env.VITE_DEV_SERVER_URL:', process.env.VITE_DEV_SERVER_URL)
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    console.log('localPath:',`file://${localPath}`)
    win.loadURL(`file://${localPath}`);
  }

  electronInstance.start();



  // 打开开发者工具
  win.webContents.openDevTools();
  // 设置允许加载本地资源的权限
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['file://.*'] }, (details, callback) => {
    if (details.url.startsWith('file:///')) {
        callback({ cancel: false });
    } else {
        callback({});
    }
});
}

app.whenReady().then(() => {
  createWindow();
  console.log('Electron 内置的 Node.js 版本:', process.versions.node);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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