const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createTray } = require('./tray');
const { updateStatus, checkWindowSize } = require('./arctis_view');

let mainWindow: any;

const createWindow = () => {
  mainWindow = new BrowserWindow({
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

      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Hide the window when it loses focus
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  return mainWindow;
};

// Don't show the app in the doc
app.dock.hide();

function handleQuit() {
  app.quit();
}

function updateView() {
  const status = updateStatus();
  mainWindow.webContents.send('handle-update', status.html);
  checkWindowSize(mainWindow, status.numberOfDevices);
}

function initialize() {
  updateView();
}

app.whenReady().then(() => {
  ipcMain.on('quit', handleQuit);
  ipcMain.on('init', initialize);

  createWindow();
  createTray(mainWindow, path);

  // Refresh 5 minutes
  const time = 5 * 60 * 1000;
  setInterval(updateView, time);
});

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit();
});
