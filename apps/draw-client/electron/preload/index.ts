import { contextBridge, ipcRenderer } from 'electron';


console.log('Preload script loaded successfully');
contextBridge.exposeInMainWorld('electron', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openDevTools: () => ipcRenderer.send('open-dev-tools')
});