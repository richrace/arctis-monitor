const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createTray } = require('./tray');
const { updateStatus } = require('./arctis_view');

let mainWindow: any;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
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
    },
  });

  return mainWindow;
};

// Don't show the app in the doc
app.dock?.hide();

function handleQuit() {
  app.quit();
}

app.whenReady().then(() => {
  createWindow();
  createTray(path);
});

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit();
});
