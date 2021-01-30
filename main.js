const {
  app, BrowserWindow, ipcMain, Tray,
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron');
const path = require('path');
const trayWindow = require('electron-tray-window');

const assetsDirectory = path.join(__dirname, 'assets');

let tray;
let window;

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'headphones.png'));
  tray.on('click', (event) => {
    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({ mode: 'detach' });
    }
  });
  return tray;
};

const createWindow = () => {
  window = new BrowserWindow({
    show: false,
    frame: false,
    width: 300,
    minHeight: 150,
    height: 150,
    maxHeight: 450,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    movable: false,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`);
  return window;
};

// Don't show the app in the doc
if (app.dock && app.dock.hide) {
  app.dock.hide();
}

app.on('ready', () => {
  trayWindow.setOptions({
    tray: createTray(),
    window: createWindow(),
  });
});

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('quit-from-tray', () => {
  app.quit();
});
