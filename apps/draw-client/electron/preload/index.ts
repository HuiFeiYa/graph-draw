import { contextBridge, ipcRenderer } from 'electron';


console.log('Preload script loaded successfully');
contextBridge.exposeInMainWorld('electron', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openDevTools: () => ipcRenderer.send('open-dev-tools'),
  // Node server 相关接口
  startNodeServer: () => ipcRenderer.invoke('start-node-server'),
  stopNodeServer: () => ipcRenderer.invoke('stop-node-server'),
  getNodeServerStatus: () => ipcRenderer.invoke('get-node-server-status')
});