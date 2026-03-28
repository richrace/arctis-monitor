import ArctisUsbFinder from 'arctis-usb-finder';
import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

export default class HeadphoneManager {
  static arctisUsbFinder = new ArctisUsbFinder();
  private cachedHeadphones: SimpleHeadphone[] = [];

  loadHeadphones(force: boolean = false): SimpleHeadphone[] {
    try {
      if (force || this.cachedHeadphones.length === 0) {
        HeadphoneManager.arctisUsbFinder.loadHeadphones();
        this.cachedHeadphones = HeadphoneManager.arctisUsbFinder.simpleHeadphones();
      } else {
        HeadphoneManager.arctisUsbFinder.refreshHeadphones();
        this.cachedHeadphones = HeadphoneManager.arctisUsbFinder.simpleHeadphones();
      }
    } catch (error) {
      // Handle errors gracefully (e.g., device disconnected, wake from sleep)
      // Return empty array so tray shows "No headphones found"
      console.error('Error loading headphones:', error);
      this.cachedHeadphones = [];
    }

    return this.cachedHeadphones;
  }
}
