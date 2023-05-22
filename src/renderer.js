const quitButton = document.getElementById("quit");

quitButton.addEventListener("click", () => {
  window.electronAPI.quit();
});

document.addEventListener("DOMContentLoaded", () => {
  window.electronAPI.init();
});

window.electronAPI.handleUpdate((event, value) => {
  const devices = document.getElementById("devices");

  devices.innerHTML = value;
});
