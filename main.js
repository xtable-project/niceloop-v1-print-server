require("dotenv").config();
require("./express/server");
require("update-electron-app")();

const {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  nativeImage,
} = require("electron");
const path = require("path");

const AutoLaunch = require("auto-launch");
const autoLauncher = new AutoLaunch({
  name: "printer_service",
});

require("update-electron-app")();
if (require("electron-squirrel-startup")) app.quit();

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

  const icon = nativeImage.createFromPath(
    path.join(__dirname, "src", "asset", "icon", "caution.png")
  );
  tray = new Tray(icon);
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

  // if (env === "development") {
  //   win.webContents.openDevTools();
  // }

  // win.webContents.openDevTools();
}

const getVersion = () => {
  return app.getVersion();
};

app.whenReady().then(() => {
  ipcMain.handle("getVersion", getVersion);
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

ipcMain.handle("quit-app", () => {
  app.exit();
});
