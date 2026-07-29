const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  openGame: () => ipcRenderer.send('open-game'),
  petContextMenu: () => ipcRenderer.send('pet-context-menu'),
});
