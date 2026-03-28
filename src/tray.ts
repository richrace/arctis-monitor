import path = require('path');

import { Tray, Menu, MenuItem } from 'electron';
import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';
import Host from 'arctis-usb-finder/dist/utils/host';

import exportView, { TrayInfo, getModelType, getShortName, getAbbrevName, getModelPriority, shortenModelName, ModelType } from './headphone_view';
import debugMenu from './menu_items/debug';
import helpMenuItem from './menu_items/help';
import quitMenuItem from './menu_items/quit';
import HeadphoneManager from './headphone_manager';
import HandleThemes from './windows/handle_themes';
import iconPicker from './windows/icon_picker';

let mainTray: Tray;
const headphoneManager = new HeadphoneManager();

// Compute display names for headphones based on count
// - 2 or fewer: use short names like "Elite", "Pro"
// - 3+: use abbreviated names like "E", "P"
// - Multiple of same type: add numeric suffix like "E1", "E2", "P1", "P2"
function computeDisplayNames(headphones: SimpleHeadphone[]): string[] {
  const useAbbrev = headphones.length > 2;

  // Count occurrences of each model type
  const typeCounts: Map<ModelType, number> = new Map();
  for (const hp of headphones) {
    const type = getModelType(hp.modelName);
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  }

  // Track current index for each type (for numbering duplicates)
  const typeIndices: Map<ModelType, number> = new Map();

  return headphones.map((hp) => {
    const type = getModelType(hp.modelName);
    const count = typeCounts.get(type) || 1;
    const baseName = useAbbrev ? getAbbrevName(type) : getShortName(type);

    if (count > 1) {
      // Multiple of same type - add numeric suffix
      const idx = (typeIndices.get(type) || 0) + 1;
      typeIndices.set(type, idx);
      return `${baseName}${idx}`;
    }

    return baseName;
  });
}

const buildTrayMenu = (force: boolean = false, debug: boolean = false) => {
  const headphones: SimpleHeadphone[] = headphoneManager.loadHeadphones(force);

  // Sort by priority: Elite first, then Pro, then Nova 7/5/1
  headphones.sort((a, b) => {
    const priorityA = getModelPriority(getModelType(a.modelName));
    const priorityB = getModelPriority(getModelType(b.modelName));
    return priorityA - priorityB;
  });

  const displayNames = computeDisplayNames(headphones);
  // Use shortened model names for alignment calculation
  const maxModelLen = headphones.reduce((max, hp) => Math.max(max, shortenModelName(hp.modelName).length), 0);
  // Check if any connected device has 100% battery (for alignment purposes)
  const hasAny100Percent = headphones.some((hp) => hp.isConnected && hp.batteryPercent === 100);
  const trayInfos: TrayInfo[] = headphones.map((headphone, i) => exportView(headphone, displayNames[i], maxModelLen, hasAny100Percent));
  const menuItems = trayInfos.map((info) => info.menuItem);

  if (menuItems.length === 0) {
    menuItems.push(new MenuItem({ label: 'No headphones found', type: 'normal' }));
    mainTray.setTitle('');
    mainTray.setToolTip('Arctis Headphones - No devices found');
    // Show headphones icon when no devices found
    if (Host.isMac()) {
      mainTray.setImage(getIcon(false));
    }
  } else {
    // Combine tray segments from all headphones
    const traySegments = trayInfos
      .map((info) => info.traySegment)
      .filter((segment): segment is string => segment !== null);

    if (traySegments.length > 0) {
      mainTray.setTitle(' ' + traySegments.join(' | '));
      // Use empty icon when we have emoji display
      if (Host.isMac()) {
        mainTray.setImage(getIcon(true));
      }
    } else {
      mainTray.setTitle('');
      // Show headphones icon when no tray segments (no battery info to display)
      if (Host.isMac()) {
        mainTray.setImage(getIcon(false));
      }
    }

    // Combine tooltip segments
    const tooltipSegments = trayInfos.map((info) => info.tooltipSegment);
    mainTray.setToolTip(tooltipSegments.join('\n'));
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

const getIcon = (empty: boolean): string => {
  const assetsDirectory = path.join(__dirname, '../assets');

  if (Host.isMac()) {
    return path.join(assetsDirectory, empty ? 'emptyTemplate.png' : 'headphonesTemplate.png');
  } else {
    return path.join(assetsDirectory, 'headphonesTemplate@2x.png');
  }
};

const createTray = async () => {
  if (Host.isWin()) {
    const handleThemes = new HandleThemes();
    mainTray = new Tray(iconPicker(await handleThemes.isUsedSystemLightTheme()));
    handleThemes.tray = mainTray;
  } else {
    mainTray = new Tray(getIcon(false)); // Start with headphones icon, will update based on devices
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'No Headphones USB devices plugged in', type: 'normal' },
  ]);
  mainTray.setToolTip('Arctis Headphones');
  mainTray.setContextMenu(contextMenu);

  mainTray.on('click', (event: { altKey: boolean; shiftKey: boolean }) => {
    const debug = event.altKey;
    const force = event.shiftKey;
    buildTrayMenu(force, debug);
  });

  buildTrayMenu();
};

// Refresh battery status every 5 minutes
const fiveMinutes = 5 * 60 * 1000;
setInterval(buildTrayMenu, fiveMinutes);

// Force refresh every 10 minutes to detect new/removed devices
const tenMinutes = 10 * 60 * 1000;
setInterval(() => buildTrayMenu(true), tenMinutes);

export default createTray;
