import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

const { app, Tray, Menu, MenuItem } = require('electron');
const { getHeadphones, refreshHeadphones } = require('arctis-usb-finder');

let mainTray: any;

let cachedHeadphones: SimpleHeadphone[] = undefined;

function loadHeadphones(force: boolean = false): SimpleHeadphone[] {
  if (force || cachedHeadphones === undefined) {
    cachedHeadphones = getHeadphones();
    console.log('forced', cachedHeadphones);
  } else {
    cachedHeadphones = refreshHeadphones(cachedHeadphones);
    console.log('not forced', cachedHeadphones);
  }

  return cachedHeadphones;
}

const parseHeadphone = (headphone: SimpleHeadphone) => {
  if (!headphone.isConnected) {
    return { label: `${headphone.modelName} - Not connected`, type: 'normal' };
  }

  let percentage = headphone.batteryPercent > 100 ? 100 : headphone.batteryPercent;
  percentage = percentage < 0 ? 0 : percentage;

  let text = `${headphone.modelName} - ${percentage}%`;
  // Set the Tool Tip so we don't have to click to see a percentage
  mainTray.setToolTip(`${text}`);

  if (headphone.isCharging) {
    text += ' 🔋 ';
  }

  if (headphone.isDischarging) {
    text += ' 🪫 ';
  }

  if (headphone.isMuted) {
    text += ' 🔇 ';
  } else {
    text += ' 🔊 ';
  }

  return { label: text };
};

const quitMenuItem = () =>
  new MenuItem({
    label: 'Quit',
    type: 'normal',
    click: () => {
      app.quit();
    },
  });

const helpMenuItem = () =>
  new MenuItem({
    label: 'Help',
    type: 'normal',
    click: async () => {
      const { shell } = require('electron');
      await shell.openExternal('https://github.com/richrace/arctis-monitor');
    },
  });

const buildTrayMenu = (force: boolean = false) => {
  const headphones: SimpleHeadphone[] = loadHeadphones(force);

  let menuItems = headphones.map(parseHeadphone);

  if (menuItems.length === 0) {
    menuItems.push({ label: 'No headphones found', type: 'normal' });
  }

  menuItems.push({ label: '', type: 'separator' });
  menuItems.push(helpMenuItem());
  menuItems.push(quitMenuItem());

  const contextMenu = Menu.buildFromTemplate(menuItems);
  mainTray.setContextMenu(contextMenu);
};

const buildTray = (path: any) => {
  const assetsDirectory = path.join(__dirname, '../assets');
  mainTray = new Tray(path.join(assetsDirectory, 'headphones.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'No Headphones USB devices plugged in', type: 'normal' },
  ]);
  mainTray.setToolTip('Arctis Headphones');
  mainTray.setContextMenu(contextMenu);

  mainTray.on('click', (event: { altKey: boolean }) => {
    loadHeadphones(event.altKey);

    buildTrayMenu();
  });
};

const minute = 60 * 1000;
setInterval(buildTrayMenu, minute);

const thirtyMinutes = 10 * 60 * 1000;
setInterval(() => buildTrayMenu(true), thirtyMinutes);

module.exports = { createTray: buildTray };
