const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    close() {
      ipcRenderer.send('closed');
    },
    readFile(filePath) {
      ipcRenderer.send('readFile', filePath);
    },
    readJsonFile(arg, callback) {
      return new Promise((resolve) => {
        ipcRenderer.once('readFile', (_, res) => {
          if (res.arg.action === arg.action) {
            if (callback) {
              callback(res);
            }
            resolve(res);
          }
        });
        ipcRenderer.send('readFile', arg);
      });
    },
    writeJsonFile(arg, callback) {
      return new Promise((resolve) => {
        ipcRenderer.once('writeFile', (_, res) => {
          if (res.arg.action === arg.action) {
            if (callback) {
              callback(res);
            }
            resolve(res);
          }
        });
        ipcRenderer.send('writeFile', arg);
      });
    },
    openFileDialog() {
      ipcRenderer.send('openFileDialog');
    },
    addRecentFile(arg) {
      ipcRenderer.send('addRecentFile', arg);
    },
    writeFile(filePath, data) {
      ipcRenderer.send('writeFile', {
        filePath,
        data,
      });
    },
    saveFileDialog(arg, callback) {
      return new Promise((resolve) => {
        ipcRenderer.once('saveFileDialog', (_, res) => {
          if (res.arg.action === arg.action) {
            if (callback) {
              callback(res);
            }
            resolve(res);
          }
        });
        ipcRenderer.send('saveFileDialog', arg);
      });
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
