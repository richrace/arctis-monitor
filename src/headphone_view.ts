import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

import * as emoji from 'node-emoji';
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

  if (percentage === 100) {
    text += emoji.emojify(' :battery: ', { fallback: ' fully charged ' });
  } else if (headphone.isCharging) {
    text += emoji.emojify(' :battery: ', { fallback: ' charging ' });
  }

  if (headphone.isDischarging) {
    text += emoji.emojify(' :low_battery: ', { fallback: ' discharging ' });
  }

  if (headphone.isMuted) {
    text += emoji.emojify(' :muted_speaker: ', { fallback: ' muted ' });
  } else {
    text += emoji.emojify(' :high_volume_speaker: ', { fallback: ' not muted ' });
  }

  return new MenuItem({ label: text });
}

export default exportView;
