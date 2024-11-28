"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  doThing: () => electron.ipcRenderer.send("do-a-thing")
});
