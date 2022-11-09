require("dotenv").config();
const serverRun = require("./express/server");
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
const exec = require("child_process").exec;
const AutoLaunch = require("auto-launch");

require("update-electron-app")();
if (require("electron-squirrel-startup")) app.quit();

const env = process.env.NODE_ENV || "development";
serverRun.run();

const isRunning = (query, cb) => {
  let platform = process.platform;
  let cmd = "";
  switch (platform) {
    case "win32":
      cmd = `tasklist`;
      break;
    case "darwin":
      cmd = `ps -ax | grep ${query}`;
      break;
    case "linux":
      cmd = `ps -A`;
      break;
    default:
      break;
  }
  exec(cmd, (err, stdout, stderr) => {
    cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
  });
};

let tray = null;
function createWindow() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "src", "asset", "icon", "printer.png")
  );

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "./src/js/preload.js"),
    },
    icon,
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

  ipcMain.handle("open", () => {
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

const getPort = () => {
  process.env.PORT = 5051;
  return process.env.PORT;
};

app.whenReady().then(() => {
  ipcMain.handle("getVersion", getVersion);
  ipcMain.handle("port", getPort);

  const autoLauncher = new AutoLaunch({
    name: "printer_service",
    path: app.getPath("exe"),
    isHidden: true,
  });

  autoLauncher
    .isEnabled()
    .then((isEnabled) => {
      if (isEnabled) return;
      autoLauncher.enable();
    })
    .catch((err) => {
      throw err;
    });

  createWindow();

  if (process.platform === "win32") {
    app.setAppUserModelId("Niceloop Printer Server");
  }

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
