import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

import { MenuItem } from 'electron';

function exportView(mainTray: any, headphone: SimpleHeadphone) {
  if (!headphone.isConnected) {
    mainTray.setTitle('');
    return new MenuItem({ label: `${headphone.modelName} - Not connected`, type: 'normal' });
  }

  let percentage = headphone.batteryPercent > 100 ? 100 : headphone.batteryPercent;
  percentage = percentage < 0 ? 0 : percentage;

  let text = `${headphone.modelName} - ${percentage}%`;

  // Set the Tool Tip and title so we don't have to click to see a percentage
  mainTray.setToolTip(`${text}`);
  mainTray.setTitle(` ${percentage}%`);

  if (percentage === 100 || headphone.isCharging) {
    text += ' \uD83D\uDD0B ';
  }

  if (headphone.isDischarging) {
    text += ' \uD83E\uDEAB ';
  }

  if (headphone.isMuted) {
    text += ' \uD83D\uDD07 ';
  } else {
    text += ' \uD83D\uDD0A ';
  }

  return new MenuItem({ label: text });
}

export default exportView;
