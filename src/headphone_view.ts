import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

import { MenuItem } from 'electron';

// Extract short name from model (e.g., "Arctis Nova Elite" -> "Elite", "Arctis Nova Pro Wireless" -> "Pro")
function getShortName(modelName: string): string {
  if (modelName.includes('Elite')) return 'Elite';
  if (modelName.includes('Pro')) return 'Pro';
  if (modelName.includes('Nova 7')) return 'Nova7';
  if (modelName.includes('Nova 5')) return 'Nova5';
  if (modelName.includes('Nova 1')) return 'Nova1';
  // Fallback: use last word
  const parts = modelName.split(' ');
  return parts[parts.length - 1];
}

export interface TrayInfo {
  menuItem: MenuItem;
  traySegment: string | null; // null if not connected, string for tray display
  tooltipSegment: string;
}

function exportView(headphone: SimpleHeadphone): TrayInfo {
  // Check for base station battery (show even if headset not connected)
  let percentage2: number | undefined;
  if (headphone.batteryPercent2 !== undefined) {
    percentage2 = headphone.batteryPercent2 > 100 ? 100 : headphone.batteryPercent2;
    percentage2 = percentage2 < 0 ? 0 : percentage2;
  }

  const shortName = getShortName(headphone.modelName);

  if (!headphone.isConnected) {
    // Check if base station battery is present
    // Show battery if: hasBattery2 is true, OR percentage2 > 0 (even if hasBattery2 is false/undefined)
    // This handles edge cases where the battery is charging but hasBattery2 detection fails
    const hasBattery = headphone.hasBattery2 === true ||
                       (percentage2 !== undefined && percentage2 > 0);

    // Build label with base station battery if available
    let label = `${headphone.modelName} - Not connected`;
    if (hasBattery && percentage2 !== undefined) {
      const baseIcon = percentage2 === 0 ? '\uD83E\uDEAB' : '\uD83D\uDD0B'; // 🪫 or 🔋
      label += `     Base: ${baseIcon} ${percentage2}%`;
    }

    // Build tray segment - only show if base battery is present
    let traySegment: string | null = null;
    if (hasBattery && percentage2 !== undefined) {
      const baseIcon = percentage2 === 0 ? '\uD83E\uDEAB' : '\uD83D\uDD0B';
      traySegment = `\uD83D\uDD07${shortName} ${baseIcon}${percentage2}%`; // 🔇 mute emoji for disconnected
    }

    return {
      menuItem: new MenuItem({ label, type: 'normal' }),
      traySegment,
      tooltipSegment: `${headphone.modelName} - Not connected`
    };
  }

  let percentage = headphone.batteryPercent > 100 ? 100 : headphone.batteryPercent;
  percentage = percentage < 0 ? 0 : percentage;

  // Build menu text: "Model - XX% [icons]    Base: YY% [icon]"
  let text = `${headphone.modelName} - ${percentage}%`;

  // Add headset battery/status icons
  if (percentage === 100 || headphone.isCharging) {
    text += ' \uD83D\uDD0B'; // 🔋
  } else if (headphone.isDischarging) {
    text += ' \uD83E\uDEAB'; // 🪫
  }

  // Add mute status
  if (headphone.isMuted) {
    text += ' \uD83D\uDD07'; // 🔇
  } else {
    text += ' \uD83D\uDD0A'; // 🔊
  }

  // Add base station battery if available
  if (percentage2 !== undefined) {
    text += `     Base: ${percentage2}%`;
    if (percentage2 === 0) {
      text += ' \uD83E\uDEAB'; // 🪫 (error/dead)
    } else if (percentage2 === 100) {
      text += ' \uD83D\uDD0B'; // 🔋 (full)
    } else {
      text += ' \uD83D\uDD0C'; // 🔌 (charging in base)
    }
  }

  // Build tray segment: "🎧Elite 🪫71%/🔋100%" or "🎧Pro 🔋100%/🔋100%"
  const headsetIcon = (percentage === 0 || headphone.isDischarging) ? '\uD83E\uDEAB' : '\uD83D\uDD0B';
  let traySegment = `\uD83C\uDFA7${shortName} ${headsetIcon}${percentage}%`; // 🎧 headphones emoji
  if (percentage2 !== undefined) {
    const baseIcon = percentage2 === 0 ? '\uD83E\uDEAB' : '\uD83D\uDD0B';
    traySegment += `/${baseIcon}${percentage2}%`;
  }

  // Build tooltip segment
  let tooltipSegment = `${headphone.modelName} - ${percentage}%`;
  if (percentage2 !== undefined) {
    tooltipSegment += ` / Base: ${percentage2}%`;
  }

  return {
    menuItem: new MenuItem({ label: text }),
    traySegment,
    tooltipSegment
  };
}

export default exportView;
