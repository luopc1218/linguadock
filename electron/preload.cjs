const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "desktop",
  Object.fromEntries(
    [
      "load",
      "saveProvider",
      "deleteProvider",
      "translate",
      "cancel",
      "importText",
      "exportText",
    ].map((name) => [name, (...args) => ipcRenderer.invoke(name, ...args)]),
  ),
);
