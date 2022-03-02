/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

let mainWindow: BrowserWindow | null = null;
let needClose = false;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('readFile', async (event, arg) => {
  if (fs.existsSync(arg.filePath)) {
    const content = fs.readFileSync(arg.filePath).toString();
    event.reply('readFile', { filePath: arg.filePath, data: content, arg });
  } else {
    event.reply('readFile', { filePath: arg.filePath, data: null, arg });
  }
});

ipcMain.on('writeFile', async (event, arg) => {
  fs.writeFileSync(arg.filePath, arg.data);
  event.reply('writeFile', { arg });
});

ipcMain.on('openFile', async (_, arg) => {
  let data;
  if (arg?.filePath) {
    data = fs.readFileSync(arg.filePath).toString();
  } else {
    data = dialog.showOpenDialogSync(mainWindow, {
      filters: [{ name: 'Data', extensions: ['json'] }],
    });
  }
  let res: any = data;
  if (Array.isArray(data)) {
    res = data?.map((item: string) => {
      return { path: item, data: fs.readFileSync(item).toString() };
    });
  } else {
    console.log(res);
    res = fs.readFileSync(res).toString();
  }
  mainWindow.webContents.send('openFile', { res, arg });
});

ipcMain.on('saveFileDialog', async (event, arg) => {
  const path = dialog.showSaveDialogSync(mainWindow, {
    filters: [{ name: 'Data', extensions: ['json'] }],
  });
  if (path) {
    fs.writeFileSync(path, arg.data);
    const data = {
      res: { path },
      arg: { action: arg?.action },
    };
    mainWindow.webContents.send('saveFileDialog', data);
  }
});

ipcMain.on('addRecentFile', async (event, arg) => {
  app.addRecentDocument(arg.newFilePath);
  fs.writeFileSync(
    path.join(__dirname, './recent_files.json'),
    JSON.stringify(arg.all)
  );
});

ipcMain.on('realClose', () => {
  needClose = true;
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }
  console.log('real close');
  mainWindow.close();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', (e) => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    console.log('event close: ', needClose);
    if (!needClose) {
      e.preventDefault();
      mainWindow.webContents.send('close');
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
