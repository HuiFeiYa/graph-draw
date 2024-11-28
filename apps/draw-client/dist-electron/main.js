import { app, BrowserWindow, Menu, session } from "electron";
import { join } from "path";
const getPath = (...args) => {
  return join(new URL(".", import.meta.url).pathname, ...args);
};
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPath("./preload/index.js"),
      nodeIntegration: false,
      // 禁用 Node 集成
      contextIsolation: true,
      // 启用上下文隔离
      sandbox: true
    }
  });
  console.log("process.env.VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL);
  const localPath = getPath("../dist/index.html");
  console.log("localPath:", `file://${localPath}`);
  win.loadURL(`file://${localPath}`);
  const template = [
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => win.reload()
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  win.webContents.openDevTools();
  session.defaultSession.webRequest.onBeforeRequest({ urls: ["file://.*"] }, (details, callback) => {
    if (details.url.startsWith("file:///")) {
      callback({ cancel: false });
    } else {
      callback({});
    }
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error) => {
  console.error("Failed to initialize app:", error);
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
