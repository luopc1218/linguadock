const { contextBridge, ipcRenderer } = require("electron");

const methods = [
  "load",
  "saveProvider",
  "deleteProvider",
  "testProvider",
  "translate",
  "cancel",
  "importText",
  "exportText",
  "getUpdateStatus",
  "checkUpdate",
  "installUpdate",
  "openReleases",
];

contextBridge.exposeInMainWorld(
  "desktop",
  Object.fromEntries([
    ...methods.map((name) => [name, (...args) => ipcRenderer.invoke(name, ...args)]),
    [
      "onUpdateStatus",
      (callback) => {
        const listener = (_event, status) => callback(status);
        ipcRenderer.on("update-status", listener);
        return () => ipcRenderer.removeListener("update-status", listener);
      },
    ],
  ]),
);
