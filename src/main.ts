import { app, BrowserWindow } from 'electron';
import createTray from './tray';

if (require('electron-squirrel-startup')) app.quit();

let mainWindow: BrowserWindow;

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

app.whenReady().then(() => {
  createWindow();
  createTray();
});

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit();
});
