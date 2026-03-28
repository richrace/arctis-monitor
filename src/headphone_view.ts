import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

import { MenuItem } from 'electron';

// Model type keys for grouping devices
export type ModelType = 'Elite' | 'Pro' | 'Nova7' | 'Nova5' | 'Nova1' | 'Other';

// Extract model type from model name
export function getModelType(modelName: string): ModelType {
  if (modelName.includes('Elite')) return 'Elite';
  if (modelName.includes('Pro')) return 'Pro';
  if (modelName.includes('Nova 7')) return 'Nova7';
  if (modelName.includes('Nova 5')) return 'Nova5';
  if (modelName.includes('Nova 1')) return 'Nova1';
  return 'Other';
}

// Get short name for a model type (used when 2 or fewer total devices)
export function getShortName(modelType: ModelType): string {
  if (modelType === 'Other') return '?';
  return modelType;
}

// Get abbreviated name for a model type (used when 3+ total devices)
export function getAbbrevName(modelType: ModelType): string {
  switch (modelType) {
    case 'Elite': return 'E';
    case 'Pro': return 'P';
    case 'Nova7': return '7';
    case 'Nova5': return '5';
    case 'Nova1': return '1';
    default: return '?';
  }
}

// Get priority for sorting (lower = higher priority, shown first)
// Elite is most premium, then Pro, then Nova 7/5/1
export function getModelPriority(modelType: ModelType): number {
  switch (modelType) {
    case 'Elite': return 0;
    case 'Pro': return 1;
    case 'Nova7': return 2;
    case 'Nova5': return 3;
    case 'Nova1': return 4;
    default: return 99;
  }
}

// Shorten model name for display (remove "Wireless" since all monitored headsets are wireless)
export function shortenModelName(modelName: string): string {
  return modelName.replace(' Wireless', '');
}

export interface TrayInfo {
  menuItem: MenuItem;
  traySegment: string | null; // null if not connected, string for tray display
  tooltipSegment: string;
}

// Emoji constants
const EMOJI = {
  BATTERY_FULL: '\uD83D\uDD0B',    // 🔋
  BATTERY_LOW: '\uD83E\uDEAB',     // 🪫
  MUTED: '\uD83D\uDD07',           // 🔇
  UNMUTED: '\uD83D\uDD0A',         // 🔊
  HEADPHONES: '\uD83C\uDFA7',      // 🎧
  CHARGING: '\uD83D\uDD0C',        // 🔌
  NO_CONN: '\uD83D\uDEAB',         // 🚫 (prohibited - disconnected indicator)
};

// displayName is computed by tray.ts based on device count (e.g., "Elite", "E", "E1", "P2")
// maxModelLen is used for alignment in the menu
// hasAny100Percent: true if any connected device has 100% battery (for alignment)
function exportView(headphone: SimpleHeadphone, displayName: string, maxModelLen: number, hasAny100Percent: boolean): TrayInfo {
  // Check for base station battery (show even if headset not connected)
  let percentage2: number | undefined;
  if (headphone.batteryPercent2 !== undefined) {
    percentage2 = headphone.batteryPercent2 > 100 ? 100 : headphone.batteryPercent2;
    percentage2 = percentage2 < 0 ? 0 : percentage2;
  }

  // Shorten model name and pad for alignment
  const shortModel = shortenModelName(headphone.modelName);
  const paddedModel = shortModel.padEnd(maxModelLen);

  if (!headphone.isConnected) {
    // Check if base station battery is present
    // Show battery if: hasBattery2 is true, OR percentage2 > 0 (even if hasBattery2 is false/undefined)
    // This handles edge cases where the battery is charging but hasBattery2 detection fails
    const hasBattery = headphone.hasBattery2 === true ||
                       (percentage2 !== undefined && percentage2 > 0);

    // Build label: "Model Name       🚫 No Conn     Base: 🔋 100%"
    // "🚫 No Conn " aligns with "XXX% 🔋 🔊" (both ~10 chars visual width)
    // Add alignment space if any connected device has 100% battery
    const alignmentSpace = hasAny100Percent ? ' ' : '';
    let label = `${paddedModel}  ${EMOJI.NO_CONN} No Conn ${alignmentSpace}`;
    if (hasBattery && percentage2 !== undefined) {
      const baseIcon = percentage2 === 0 ? EMOJI.BATTERY_LOW : EMOJI.BATTERY_FULL;
      label += `    Base: ${baseIcon} ${percentage2}%`;
    }

    // Build tray segment - only show if base battery is present
    // Use muted + no conn emojis: "🔇🚫Elite 🔋100%"
    let traySegment: string | null = null;
    if (hasBattery && percentage2 !== undefined) {
      const baseIcon = percentage2 === 0 ? EMOJI.BATTERY_LOW : EMOJI.BATTERY_FULL;
      traySegment = `${EMOJI.MUTED}${EMOJI.NO_CONN}${displayName} ${baseIcon}${percentage2}%`;
    }

    // Build tooltip segment with base battery info
    let tooltipSegment = `${shortModel}: No Conn`;
    if (hasBattery && percentage2 !== undefined) {
      tooltipSegment += ` / Base: ${percentage2}%`;
    }

    return {
      menuItem: new MenuItem({ label, type: 'normal' }),
      traySegment,
      tooltipSegment
    };
  }

  let percentage = headphone.batteryPercent > 100 ? 100 : headphone.batteryPercent;
  percentage = percentage < 0 ? 0 : percentage;

  // Build menu text with alignment: "Model Name       🔋 XXX% 🔊    Base: 🔋 YY%"
  // Icon before percentage to match tray format
  const paddedPercent = String(percentage).padStart(3) + '%';

  // Add headset battery icon (icon before %)
  let batteryIcon: string;
  if (percentage === 100 || headphone.isCharging) {
    batteryIcon = EMOJI.BATTERY_FULL;
  } else if (headphone.isDischarging) {
    batteryIcon = EMOJI.BATTERY_LOW;
  } else {
    batteryIcon = EMOJI.BATTERY_FULL;
  }

  // Add mute status icon right after battery icon
  const muteIcon = headphone.isMuted ? EMOJI.MUTED : EMOJI.UNMUTED;

  // Add extra space for alignment if this device is <100% but another device has 100%
  const alignmentSpace = (percentage < 100 && hasAny100Percent) ? ' ' : '';
  let text = `${paddedModel}  ${batteryIcon}${muteIcon}  ${alignmentSpace}${paddedPercent}`;

  // Add base station battery if available (icon before % for consistency with tray)
  if (percentage2 !== undefined) {
    const baseIcon = percentage2 === 0 ? EMOJI.BATTERY_LOW : (percentage2 === 100 ? EMOJI.BATTERY_FULL : EMOJI.CHARGING);
    text += `     Base: ${baseIcon} ${percentage2}%`;
  }

  // Build tray segment: "🎧Elite 🔋79%/🔋100%" (icon before % consistently)
  const headsetIcon = (percentage === 0 || headphone.isDischarging) ? EMOJI.BATTERY_LOW : EMOJI.BATTERY_FULL;
  let traySegment = `${EMOJI.HEADPHONES}${displayName} ${headsetIcon}${percentage}%`;
  if (percentage2 !== undefined) {
    const baseIcon = percentage2 === 0 ? EMOJI.BATTERY_LOW : EMOJI.BATTERY_FULL;
    traySegment += `/${baseIcon}${percentage2}%`;
  }

  // Build tooltip segment
  let tooltipSegment = `${shortModel}: ${percentage}%`;
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
