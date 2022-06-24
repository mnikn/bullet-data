const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    close() {
      console.log('gffg');
      ipcRenderer.send('realClose');
    },
    readFile(filePath) {
      ipcRenderer.send('readFile', filePath);
    },
    readJsonFile(arg, callback) {
      return new Promise((resolve) => {
        ipcRenderer.on('readFile', (_, res) => {
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
    readFolder(arg, callback) {
      return new Promise((resolve) => {
        ipcRenderer.once('readFolder', (_, res) => {
          if (res.arg.action === arg.action) {
            if (callback) {
              callback(res);
            }
            resolve(res);
          }
        });
        ipcRenderer.send('readFolder', arg);
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
    newFile() {
      ipcRenderer.send('newFile', { action: 'new-file' });
    },
    openFile(extension = undefined) {
      ipcRenderer.send('openFile', { action: 'open-file', extension });
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
