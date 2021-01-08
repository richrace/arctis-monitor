/* eslint-disable no-console */
const HID = require('node-hid');
const headphones = require('./headphones');

HID.setDriverType('libusb');

function findDevices() {
  const devices = HID.devices();

  return devices
    .map((usbDevice) => {
      const supportedDevice = headphones.find(
        (wantedDevice) => usbDevice.vendorId === wantedDevice.vendorId
          && usbDevice.productId === wantedDevice.productId
          && usbDevice.usage !== 1,
      );
      return supportedDevice
        ? { ...usbDevice, additional: supportedDevice }
        : false;
    })
    .filter((el) => !!el);
}

function processDevices(devices, callback) {
  devices.forEach((deviceInfo) => {
    const device = new HID.HID(deviceInfo.path);
    const {
      writeBytes,
      batteryPercentIdx,
      chargingStatusIdx,
      micStatusIdx,
    } = deviceInfo.additional;
    if (!device) {
      console.log('Could not find device :(');
      return;
    }

    console.log('looking at:', deviceInfo);

    try {
      device.write(writeBytes);
      const report = device.readSync();
      console.log('RAW', report, report.length);

      const status = {
        batteryPercent: report[batteryPercentIdx],
      };

      if (chargingStatusIdx !== null) {
        status.chargingInfo = report[chargingStatusIdx];
      }

      if (micStatusIdx !== null) {
        status.micStatus = report[micStatusIdx];
      }

      callback(deviceInfo, status);
    } catch (error) {
      console.log(
        'Error: Cannot write to Arctis Wireless device. Please replug the device.',
        error,
      );
    } finally {
      device.close();
    }
  });
}

module.exports = {
  findDevices,
  processDevices,
};
