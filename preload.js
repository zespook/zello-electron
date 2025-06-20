const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jellyfin', {
  connectToServer: (url) => ipcRenderer.invoke('connect-to-server', url)
});