import path = require('path');

const iconPicker = (lightTheme: boolean) => {
  const assetsDirectory = path.join(__dirname, '../../assets');

  console.log('icon', lightTheme);
  if (lightTheme) {
    return path.join(assetsDirectory, 'icon.ico');
  } else {
    return path.join(assetsDirectory, 'icon_white.ico');
  }
};

export default iconPicker;
