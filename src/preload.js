const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  quit: () => ipcRenderer.send("quit"),
  init: () => ipcRenderer.send("init"),
  handleUpdate: (callback) => ipcRenderer.on("handle-update", callback),
});
