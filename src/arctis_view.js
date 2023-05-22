const { getHeadphones } = require("arctis-usb-finder");

const deviceHTMLTemplate =
  " \
  <div id='{{ deviceID }}' class='device'> \
    <div class='product'>{{ product }}</div> \
    <div class='details'> \
      <div class='battery'> \
        Battery %: <span class='percent'>{{ batPercent }}</span> {{ chargingStatus }} \
      </div> \
      <div class='muted'> \
        Muted? <span class='bool'>{{ isMuted }}</span> \
      </div> \
    </div> \
  </div> \
";

const deviceTurnedOffTemplate =
  " \
  <div id='{{ deviceID }}' class='device'> \
    <div class='product'>{{ product }}</div> \
    <div>This device is not connected or the headset is not turned on.</div> \
  <div> \
";

function checkWindowSize(mainWindow, numberOfDevices) {
  const width = 300;
  const animate = false;
  const deviceRow = 62;
  const otherPadding = 70;

  let height = otherPadding;

  if (numberOfDevices.length > 0) {
    height += deviceRow * numberOfDevices;
  }

  height = Math.min(400, height);

  mainWindow.setSize(width, height, animate);
}

const renderNotConnected = (device, deviceID) => {
  return `${deviceTurnedOffTemplate}`
    .replace("{{ deviceID }}", deviceID)
    .replace("{{ product }}", device.modelName);
};

const renderConnected = (device, deviceID) => {
  let percentage = device.batteryPercent > 100 ? 100 : device.batteryPercent;
  percentage = percentage < 0 ? 0 : percentage;

  const muted = device.isMuted ? "Yes" : "No";
  const charging = device.isCharging;
  const discharging = device.isDischarging;
  const dischargingIcon = discharging ? "down" : false;
  const icon = charging ? "up" : dischargingIcon;
  let chargingIcon = "";

  if (icon) {
    chargingIcon = `<span class="icon icon-${icon}"></span>`;
  }

  return `${deviceHTMLTemplate}`
    .replace("{{ deviceID }}", deviceID)
    .replace("{{ product }}", device.modelName)
    .replace("{{ batPercent }}", percentage)
    .replace("{{ isMuted }}", muted)
    .replace("{{ chargingStatus }}", chargingIcon);
};

const updateStatus = () => {
  const devices = getHeadphones();

  if (devices.length === 0) {
    return {
      numberOfDevices: devices.length,
      html: "<div>Sorry no devices found!</div>",
    };
  }

  const html = devices.reduce((reducerHtml, device, index) => {
    const notConnected = !device.isConnected;

    const deviceID = `device-${index}`;

    let tempHtml = "";

    if (notConnected) {
      tempHtml = renderNotConnected(device, deviceID);
    } else {
      tempHtml = renderConnected(device, deviceID);
    }

    reducerHtml += tempHtml;

    return reducerHtml;
  }, "");

  return {
    numberOfDevices: devices.length,
    html,
  };
};

module.exports = { updateStatus, checkWindowSize };
