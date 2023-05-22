const { Tray } = require("electron");
const path = require("path");
const assetsDirectory = path.join(__dirname, "../assets");

let mainTray;

const getWindowPosition = (mainWindow) => {
  const windowBounds = mainWindow.getBounds();
  const trayBounds = mainTray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return { x, y };
};

const showWindow = (mainWindow) => {
  const position = getWindowPosition(mainWindow);
  mainWindow.setPosition(position.x, position.y, false);
  mainWindow.show();
  mainWindow.focus();
};

const toggleWindow = (mainWindow) => {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow(mainWindow);
  }
};

const createTray = (mainWindow) => {
  mainTray = new Tray(path.join(assetsDirectory, "headphones.png"));
  mainTray.on("right-click", () => toggleWindow(mainWindow));
  mainTray.on("double-click", () => toggleWindow(mainWindow));
  mainTray.on("click", (event) => {
    toggleWindow(mainWindow);

    // Show devtools when command clicked
    if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
      mainWindow.openDevTools({ mode: "detach" });
    }
  });
};

module.exports = { createTray };
