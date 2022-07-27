const { contextBridge, ipcRenderer } = require('electron');

function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now(); // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    close() {
      ipcRenderer.send('realClose');
    },
    readFile(filePath) {
      ipcRenderer.send('readFile', filePath);
    },
    async readJsonFile(arg) {
      return new Promise((resolve) => {
        ipcRenderer.on('readFile', (_, res) => {
          if (res.arg.action === arg.action) {
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
    async openFile(extensions = undefined) {
      const id = generateUUID();
      ipcRenderer.send('openFile', {
        action: 'open-file',
        extensions,
        action: id,
      });
      return new Promise((resolve) => {
        const handle = (_, res) => {
          if (res.arg.action === id) {
            resolve(res);
            ipcRenderer.off('openFile', handle);
          }
        };
        ipcRenderer.on('openFile', handle);
      });
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
    async saveFile(arg) {
      const id = generateUUID();
      return new Promise((resolve) => {
        const handle = (_, res) => {
          if (res.arg.action === id) {
            resolve(res);
            ipcRenderer.off('openFile', handle);
          }
        };
        ipcRenderer.on('saveFile', handle);
        ipcRenderer.send('saveFile', { action: id, ...arg });
      });
    },
    async call(command, arg) {
      const id = generateUUID();
      return new Promise((resolve) => {
        const handle = (_, res) => {
          if (res.arg.action === id) {
            resolve(res);
            ipcRenderer.off(command, handle);
          }
        };
        ipcRenderer.on(command, handle);
        ipcRenderer.send(command, { action: id, ...arg });
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
