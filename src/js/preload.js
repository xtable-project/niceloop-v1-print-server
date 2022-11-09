const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("quit", {
  exit: () => {
    ipcRenderer.invoke("quit-app");
  },
  version: () => ipcRenderer.invoke("getVersion"),
  port: () => ipcRenderer.invoke("getPort"),
  open: () => ipcRenderer.invoke("open"),
});
