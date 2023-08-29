import ProbeResult from 'arctis-usb-finder/dist/interfaces/probe_result';
import UsbDevice from 'arctis-usb-finder/dist/interfaces/usb_device';
import Probe from 'arctis-usb-finder/dist/use_cases/probe';

import { MenuItem, clipboard } from 'electron';

function debugMenu(): MenuItem {
  const probe = new Probe();
  const steelseriesHeadsets = probe.steelseriesHeadsets();
  const foundHeadphones = probe.testUnknownHeadset(steelseriesHeadsets);

  let probeMenuItems = [{ label: 'No headphones found' }];
  let foundButNotConnected = [{ label: 'No headphones found' }];

  const filteredSteelseriesHeadsets = steelseriesHeadsets.filter((headset) => {
    return foundHeadphones.some((foundHeadphone) => {
      console.log('comparing', headset.productId !== foundHeadphone.device.productId);
      return headset.productId !== foundHeadphone.device.productId;
    });
  });

  if (filteredSteelseriesHeadsets.length > 0) {
    foundButNotConnected = steelseriesHeadsets.reduce((menuItems, device: UsbDevice) => {
      menuItems.push({
        label: device.realDevice().product,
        submenu: [
          { label: `Product ID: ${device.productId}` },
          { label: `Bytes: Uknown` },
          { label: `Report: Uknown` },
          { label: `Path: ${device.path()}` },
        ],
      });

      return menuItems;
    }, []);
  }

  if (foundHeadphones.length > 0) {
    probeMenuItems = foundHeadphones.reduce((menuItems, result: ProbeResult) => {
      const path = result.device.path();

      menuItems.push({
        label: result.device.realDevice().product,
        submenu: [
          { label: `Product ID: ${result.device.productId}` },
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
    submenu: [
      { label: 'Found but not connected', submenu: foundButNotConnected },
      { label: 'Found and possibly not confirgured', submenu: probeMenuItems },
    ],
  });
}

export default debugMenu;
