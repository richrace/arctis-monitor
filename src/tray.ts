import { Tray, Menu, MenuItem } from 'electron';
import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

import exportView from './headphone_view';
import debugMenu from './menu_items/debug';
import helpMenuItem from './menu_items/help';
import quitMenuItem from './menu_items/quit';
import loadHeadphones from './load_headphones';

let mainTray: any;

const buildTrayMenu = (force: boolean = false, debug: boolean = false) => {
  const headphones: SimpleHeadphone[] = loadHeadphones(force);
  const menuItems = headphones.map((headphone) => exportView(mainTray, headphone));

  if (menuItems.length === 0) {
    menuItems.push(new MenuItem({ label: 'No headphones found', type: 'normal' }));
  }

  menuItems.push(new MenuItem({ label: '', type: 'separator' }));

  if (debug) {
    menuItems.push(debugMenu());
  }

  menuItems.push(helpMenuItem());
  menuItems.push(quitMenuItem());

  const contextMenu = Menu.buildFromTemplate(menuItems);
  mainTray.setContextMenu(contextMenu);
};

const createTray = (path: any) => {
  const assetsDirectory = path.join(__dirname, '../assets');
  mainTray = new Tray(path.join(assetsDirectory, 'headphones.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'No Headphones USB devices plugged in', type: 'normal' },
  ]);
  mainTray.setToolTip('Arctis Headphones');
  mainTray.setContextMenu(contextMenu);

  mainTray.on('click', (event: { altKey: boolean; ctrlKey: boolean }) => {
    const debug = event.altKey;
    const force = event.ctrlKey;
    buildTrayMenu(force, debug);
  });

  buildTrayMenu();
};

// Refresh every five minutes
const minute = 300 * 1000;
setInterval(buildTrayMenu, minute);

// Force refresh every thirty minutes to detect any use.
const thirtyMinutes = 10 * 60 * 1000;
setInterval(() => buildTrayMenu(true), thirtyMinutes);

export default createTray;
