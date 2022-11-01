require("dotenv").config();
require("./express/server");

// require("electron-reload")(__dirname, {
//   electron: path.join(__dirname, "node_modules", ".bin", "electron"),
// });

const { app, autoUpdater, dialog, BrowserWindow } = require("electron");
const path = require("path");

const server =
  "https://printer-queue-niceloop-dj161j9n6-hellomurphy.vercel.app";
const url = `${server}/update/${process.platform}/${app.getVersion()}`;

autoUpdater.setFeedURL({ url });

const AutoLaunch = require("auto-launch");
const autoLauncher = new AutoLaunch({
  name: "printer_service",
});

const env = process.env.NODE_ENV || "development";

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

  // if (env === "development" || env === "production") {
  //   win.webContents.openDevTools();
  // }
}

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    autoUpdater.checkForUpdates();
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

autoUpdater.on("error", (message) => {
  console.error("There was a problem updating the application");
  console.error(message);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
