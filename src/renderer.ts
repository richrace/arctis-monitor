const quitButton = document.getElementById('quit');

quitButton.addEventListener('click', () => {
  (window as any).electronAPI.quit();
});

document.addEventListener('DOMContentLoaded', () => {
  (window as any).electronAPI.init();
});

(window as any).electronAPI.handleUpdate((event: any, value: string) => {
  const devices = document.getElementById('devices');

  devices.innerHTML = value;
});
