import { MenuItem } from 'electron';

const helpMenuItem = () =>
  new MenuItem({
    label: 'Help',
    type: 'normal',
    click: async () => {
      const { shell } = require('electron');
      await shell.openExternal('https://github.com/richrace/arctis-monitor');
    },
  });

export default helpMenuItem;
