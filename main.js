require("dotenv").config();
require("./express/server");

const {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
} = require("electron");
const path = require("path");

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

let tray = null;
function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "./src/js/preload.js"),
    },
  });

  win.loadFile("./src/index.html");

  win.on("minimize", (event) => {
    event.preventDefault();
    win.hide();
  });

  win.on("close", (event) => {
    event.preventDefault();
    win.hide();
  });

  tray = new Tray("./src/asset/icon/caution.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Exit",
      click: () => {
        app.exit();
      },
    },
  ]);
  tray.setToolTip("Printer Queue Running");
  tray.setContextMenu(contextMenu);
  tray.addListener("click", () => {
    win.show();
  });

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

ipcMain.handle("quit-app", () => {
  app.quit();
});
