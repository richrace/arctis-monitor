import ProbeResult from 'arctis-usb-finder/dist/interfaces/probe_result';
import Probe from 'arctis-usb-finder/dist/use_cases/probe';

import { MenuItem, clipboard } from 'electron';

function debugMenu(): MenuItem {
  const probe = new Probe();
  const foundHeadphones = probe.testUnknownHeadset();

  let probeMenuItems = [{ label: 'No headphones found' }];

  if (foundHeadphones.length > 0) {
    probeMenuItems = foundHeadphones.reduce((menuItems, result: ProbeResult) => {
      const path = result.devicePath;

      menuItems.push({
        label: result.deviceProductName,
        submenu: [
          { label: `Product ID: ${result.deviceProductId}` },
          {
            label: `Bytes: ${result.matchedBytes}`,
            click: () => {
              clipboard.writeText(`Bytes: ${result.matchedBytes}`);
            },
          },
          {
            label: `Report: ${result.matchedReport}`,
            click: () => {
              clipboard.writeText(`Report: ${result.matchedReport}`);
            },
          },
          {
            label: `Path: ${path.slice(0, 50)}...`,
            toolTip: `Path: ${path}`,
            click: () => {
              clipboard.writeText(`Path: ${path}`);
            },
          },
        ],
      });

      return menuItems;
    }, []);
  }

  return new MenuItem({
    label: 'Debug',
    type: 'submenu',
    submenu: [{ label: 'Found and possibly not confirgured', submenu: probeMenuItems }],
  });
}

export default debugMenu;
