const { app, screen, shell, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const rpc = require('discord-rpc');

const Config = require('electron-config');
const config = new Config();

const showDevTools = process.argv.includes('--dev');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = undefined;

const createWindow = () => {
  const size = screen.getPrimaryDisplay().workAreaSize;

  const opts = {
    show: false,
    icon: './icons/icon.png',
    minWidth: 1440,
    minHeight: 900,
  };

  Object.assign(opts, config.get('winBounds'));

  if (!opts.width) opts.width = size.width;
  if (!opts.height) opts.height = size.height;
  if (!opts.x) opts.x = 0;
  if (!opts.y) opts.y = 0;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...opts,
    webPreferences: {
      nodeIntegration: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  mainWindow.setMenu(null);
  mainWindow.once('ready-to-show', mainWindow.show);

  mainWindow.on('close', () => {
    config.set('winBounds', mainWindow.getBounds());
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // and load the index.html of the app.
  const indexPath =
    process.env.APP_URL || path.join(__dirname, '..', 'browser', 'index.html');

  // prod or prod-like
  if (indexPath.includes('.html')) {
    const filePath = url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true,
    });

    setTimeout(() => {
      mainWindow.loadURL(filePath);
    }, 0);

    // dev or dev-like
  } else {
    mainWindow.loadURL(indexPath);
  }

  // Open the DevTools in dev mode
  if (showDevTools) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!mainWindow || BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const DISCORD_CLIENT_ID = '1404253128559296613';

const handleRPC = () => {
  const isRegistered = rpc.register(DISCORD_CLIENT_ID); // only needed if we want spectate / join / ask to join
  if (!isRegistered) return;

  const rpcClient = new rpc.Client({ transport: 'ipc' });
  let startTimestamp;

  const setActivity = () => {
    if (!rpcClient || !mainWindow) {
      return;
    }

    mainWindow.webContents
      .executeJavaScript('window.discordRPCStatus')
      .then((result) => {
        if (!result) {
          rpcClient.clearActivity();
          startTimestamp = null;
          return;
        }

        if (!startTimestamp) {
          startTimestamp = new Date();
        }

        rpcClient.setActivity({
          startTimestamp,
          state: result.state || 'Idle',
          details: result.details,
          smallImageKey: result.smmallImageKey,
          smallImageText: result.smallImageText,
          largeImageKey: result.largeImageKey || 'glowrift-duskhall',
          largeImageText: result.largeImageText,
        });
      });
  };

  rpcClient.on('ready', () => {
    setActivity();

    setInterval(() => {
      setActivity();
    }, 15e3);
  });

  rpcClient.login({ clientId: DISCORD_CLIENT_ID }).catch(console.error);
};

handleRPC();
