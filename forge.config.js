module.exports = {
  packagerConfig: {
    icon: './assets/icon.icns',
    out: './out',
    overwrite: true,
    executableName: 'arctis-monitor',
  },
  buildIdentifier: 'arctis-monitor-build',
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'arctis-monitor',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      executableName: 'arctis-monitor',
      config: {
        options: {
          maintainer: 'Richard Race',
          homepage: 'https://github.com/richrace/arctis-monitor',
          name: 'Arctis Monitor',
          productName: 'Arctis Monitor',
          bin: 'arctis-monitor',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'richrace',
          name: 'arctis-monitor',
        },
        prerelease: true,
        draft: true,
      },
    },
  ],
};
