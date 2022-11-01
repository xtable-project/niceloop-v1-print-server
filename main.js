const { app, BrowserWindow } = require("electron");
const path = require("path");

require("dotenv").config();
require("./express/server");
require('update-electron-app')()

const AutoLaunch = require("auto-launch");
const autoLauncher = new AutoLaunch({
  name: "printer_service",
});

const env = process.env.NODE_ENV || "development";

if (env === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

autoLauncher
  .isEnabled()
  .then((isEnabled) => {
    if (isEnabled) return;
    autoLauncher.enable();
  })
  .catch((err) => {
    throw err;
  });

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "./src/js/preload.js"),
    },
  });

  win.loadFile("./src/index.html");

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
