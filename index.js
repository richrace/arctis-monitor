/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-multi-str */
/* eslint-disable no-console */
const { ipcRenderer } = require('electron');
const { remote } = require('electron');
const { findDevices, processDevices } = require('./lib/devices');

const deviceHTMLTemplate = " \
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

const deviceTurnedOffTemplate = " \
  <div id='{{ deviceID }}' class='device'> \
    <div class='product'>{{ product }}</div> \
    <div>This device is not connected or the headset is not turned on.</div> \
  <div> \
";

function checkWindowSize() {
  const win = remote.getCurrentWindow();
  const width = 300;
  const animate = false;
  const deviceRow = 62;
  const otherPadding = 70;

  let height = otherPadding;

  height += deviceRow * document.querySelectorAll('.device').length;

  height = Math.min(400, height);

  win.setSize(width, height, animate);
}

function updateStatus() {
  const devices = findDevices();

  if (devices.length === 0) {
    document.querySelector('.devices').innerHTML = '<div>Sorry no devices found!</div>';

    return;
  }

  processDevices(devices, (device, status) => {
    let percentage = status.batteryPercent > 100 ? 100 : status.batteryPercent;
    percentage = percentage < 0 ? 0 : percentage;

    const muted = status.micStatus === 1 ? 'Yes' : 'No';
    const charging = status.chargingInfo === 1;
    const discharging = status.chargingInfo === 3;
    const notConnected = status.chargingInfo === 0;

    const deviceID = `device-${device.productId}`;

    console.log('Rendering device: ', device);
    let html;

    if (notConnected) {
      console.log('Not connected');
      html = `${deviceTurnedOffTemplate}`
        .replace('{{ deviceID }}', deviceID)
        .replace('{{ product }}', device.additional.name);
    } else {
      console.log('Connected');
      const dischargingIcon = discharging ? 'down' : false;
      const icon = charging ? 'up' : dischargingIcon;
      let chargingIcon = '';

      if (icon) {
        chargingIcon = `<span class="icon icon-${icon}"></span>`;
      }

      html = `${deviceHTMLTemplate}`
        .replace('{{ deviceID }}', deviceID)
        .replace('{{ product }}', device.additional.name)
        .replace('{{ batPercent }}', percentage)
        .replace('{{ isMuted }}', muted)
        .replace('{{ chargingStatus }}', chargingIcon);
    }

    console.log('Rendering:', html);
    if (document.querySelector(`#${deviceID}`)) {
      document.querySelector(`#${deviceID}`).outerHTML = html;
    } else {
      document.querySelector('.devices').insertAdjacentHTML('beforeend', html);
    }

    if (status.micStatus === undefined) {
      document.querySelector(`#${deviceID}`).querySelector('.muted').remove();
    }

    checkWindowSize();
  });
}

function init() {
  document.querySelector('button#quit').addEventListener('click', () => {
    ipcRenderer.send('quit-from-tray');
  });

  updateStatus();

  // Refresh 5 minutes
  const time = 5 * 60 * 1000;
  setInterval(updateStatus, time);
}

document.addEventListener('DOMContentLoaded', init);
