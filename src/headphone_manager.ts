import ArctisUsbFinder from 'arctis-usb-finder';
import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

export default class HeadphoneManager {
  static arctisUsbFinder = new ArctisUsbFinder();
  private cachedHeadphones: SimpleHeadphone[];

  loadHeadphones(force: boolean = false): SimpleHeadphone[] {
    if (force || this.cachedHeadphones === undefined) {
      HeadphoneManager.arctisUsbFinder.loadHeadphones();
      this.cachedHeadphones = HeadphoneManager.arctisUsbFinder.simpleHeadphones();
      console.log('forced', this.cachedHeadphones);
    } else {
      HeadphoneManager.arctisUsbFinder.refreshHeadphones();
      this.cachedHeadphones = HeadphoneManager.arctisUsbFinder.simpleHeadphones();
      console.log('not forced', this.cachedHeadphones);
    }

    return this.cachedHeadphones;
  }
}
