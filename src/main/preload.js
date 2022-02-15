const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    readFile(filePath) {
      ipcRenderer.send('readFile', filePath);
    },
    openFileDialog() {
      ipcRenderer.send('openFileDialog');
    },
    writeFile(filePath, data) {
      ipcRenderer.send('writeFile', {
        filePath,
        data,
      });
    },
    saveFileDialog(arg) {
      ipcRenderer.send('saveFileDialog', arg);
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeListener(channel, func) {
      ipcRenderer.removeListener(channel, func);
    },
    removeAllListeners(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
