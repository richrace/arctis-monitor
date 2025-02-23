module.exports = {
  packagerConfig: {
    icon: './assets/icon',
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
        iconUrl: 'https://raw.githubusercontent.com/richrace/arctis-monitor/main/assets/icon.ico',
        setupIcon: './assets/icon.ico',
      },
    },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'] },
    { name: '@electron-forge/maker-dmg', config: { format: 'ULFO', icon: './assets/icon.icns' } },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: { owner: 'richrace', name: 'arctis-monitor' },
        prerelease: false,
        draft: true,
      },
    },
  ],
};
