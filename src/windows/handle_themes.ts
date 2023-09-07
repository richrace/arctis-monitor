import { Tray, nativeTheme } from 'electron';
import Registry = require('winreg');
import iconPicker from './icon_picker';

export default class HandleThemes {
  tray: Tray;

  constructor() {
    nativeTheme.on('updated', () => this.handleThemeChange());
  }

  async isUsedSystemLightTheme(): Promise<boolean> {
    const reg = new Registry({
      hive: Registry.HKCU,
      key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize',
    });
    return new Promise((resolve) =>
      reg.get('SystemUsesLightTheme', (err: any, item: { value: string }) => {
        if (!err) return resolve(item.value === '0x1');
        resolve(false);
      })
    );
  }

  async handleThemeChange() {
    const isLightTheme = await this.isUsedSystemLightTheme();
    console.log('in updated', isLightTheme);

    this.tray.setImage(iconPicker(isLightTheme));
  }
}
