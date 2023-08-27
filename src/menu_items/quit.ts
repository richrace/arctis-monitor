import { app, MenuItem } from 'electron';

const quitMenuItem = () =>
  new MenuItem({
    label: 'Quit',
    type: 'normal',
    click: () => {
      app.quit();
    },
  });

export default quitMenuItem;
