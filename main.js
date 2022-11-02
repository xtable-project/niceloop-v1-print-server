require("dotenv").config();
require("./express/server");

const { app, autoUpdater, dialog, BrowserWindow } = require("electron");
const path = require("path");

const server =
  "https://printer-queue-niceloop-dj161j9n6-hellomurphy.vercel.app";
const url = `${server}/update/${process.platform}/${app.getVersion()}`;

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

  if (env === "development") {
    win.webContents.openDevTools();
  }

  // autoUpdater.setFeedURL({ url });
  // autoUpdater.checkForUpdates();
}

// autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: "info",
//     buttons: ["Restart", "Later"],
//     title: "Application Update",
//     message: process.platform === "win32" ? releaseNotes : releaseName,
//     detail:
//       "A new version has been downloaded. Restart the application to apply the updates.",
//   };

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall();
//   });
// });

// autoUpdater.on("update-available", () => {
//   console.log("Have new version!!!!");
// });

// autoUpdater.on("update-not-available", () => {
//   console.log("Not have new version!!!!");
// });

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// autoUpdater.on("error", (message) => {
//   console.error("There was a problem updating the application");
//   console.error(message);
// });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
