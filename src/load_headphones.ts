import ArctisUsbFinder from 'arctis-usb-finder';
import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

let cachedHeadphones: SimpleHeadphone[] = undefined;
const arctisUsbFinder = new ArctisUsbFinder();

function loadHeadphones(force: boolean = false): SimpleHeadphone[] {
  if (force || cachedHeadphones === undefined) {
    arctisUsbFinder.loadHeadphones();
    cachedHeadphones = arctisUsbFinder.simpleHeadphones();
    console.log('forced', cachedHeadphones);
  } else {
    arctisUsbFinder.refreshHeadphones();
    cachedHeadphones = arctisUsbFinder.simpleHeadphones();
    console.log('not forced', cachedHeadphones);
  }

  return cachedHeadphones;
}

export default loadHeadphones;
