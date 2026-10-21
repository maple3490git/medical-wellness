"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  db: {
    isAvailable: () => ipcRenderer.invoke("db:isAvailable"),
    patients: {
      list: () => ipcRenderer.invoke("db:patients:list"),
      get: (id) => ipcRenderer.invoke("db:patients:get", id),
      create: (data) => ipcRenderer.invoke("db:patients:create", data),
      update: (id, patch) => ipcRenderer.invoke("db:patients:update", id, patch),
      remove: (id) => ipcRenderer.invoke("db:patients:remove", id),
      count: () => ipcRenderer.invoke("db:patients:count"),
    },
  },
});
