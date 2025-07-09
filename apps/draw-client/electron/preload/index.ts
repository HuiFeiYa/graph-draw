import { contextBridge, ipcRenderer } from 'electron';


console.log('Preload script loaded successfully');
contextBridge.exposeInMainWorld('electron', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openDevTools: () => ipcRenderer.send('open-dev-tools'),
  closeProject: () => ipcRenderer.invoke('close-project'),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  unmaximize: () => ipcRenderer.invoke('window-unmaximize'),
  closeWindow: () => ipcRenderer.invoke('window-close')
});