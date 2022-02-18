const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    readFile(filePath) {
      ipcRenderer.send('readFile', filePath);
    },
    readJsonFile(arg, callback) {
      ipcRenderer.once('readFile', (_, res) => {
        if (res.arg.action === arg.action) {
          callback(res);
        }
      });
      ipcRenderer.send('readFile', arg);
    },
    writeJsonFile(arg, callback) {
      ipcRenderer.once('writeFile', (_, res) => {
        if (res.arg.action === arg.action) {
          if (callback) {
            callback(res);
          }
        }
      });
      ipcRenderer.send('writeFile', arg);
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
    saveFileDialog(arg, callback) {
      ipcRenderer.once('saveFileDialog', (_, res) => {
        if (res.arg.action === arg.action) {
          if (callback) {
            callback(res);
          }
        }
      });
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
