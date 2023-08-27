import { getHeadphones, refreshHeadphones } from 'arctis-usb-finder';
import SimpleHeadphone from 'arctis-usb-finder/dist/interfaces/simple_headphone';

let cachedHeadphones: SimpleHeadphone[] = undefined;

function loadHeadphones(force: boolean = false): SimpleHeadphone[] {
  if (force || cachedHeadphones === undefined) {
    cachedHeadphones = getHeadphones();
    console.log('forced', cachedHeadphones);
  } else {
    cachedHeadphones = refreshHeadphones(cachedHeadphones);
    console.log('not forced', cachedHeadphones);
  }

  return cachedHeadphones;
}

export default loadHeadphones;
