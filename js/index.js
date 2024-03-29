const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  Tray,
  electron,
} = require("electron");
const AutoLaunch = require("auto-launch");
const path = require("path");
const settings = require("electron-settings");
const fs = require("fs");
var pathExist = fs.existsSync(settings.file());

// Start on startup
var myAutoLauncher = new AutoLaunch({
  name: "Clock",
});
var isChecked;

if (pathExist) {
  // Get the boolean value of startup
  isChecked = settings.get("isChecked") ? settings.get("isChecked") : false;
} else {
  isChecked = false;
}

// Create the window
function createWindow() {
  let win = new BrowserWindow({
    width: 450,
    height: 194,
    frame: false,
    show: false,
    resizable: true, //Weird window
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  });

  // load the index.html of the app
  win.loadFile("views/index.html");

  // Uncomment to toggle the dev tools
  // win.webContents.openDevTools({
  //   mode: 'detach'
  // })

  // Path for the icon
  let iconPath = path.join(__dirname, "../img/clock.png");
  tray = new Tray(iconPath);

  //Context menu for the tray icon
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Start with Windows",
      type: "checkbox",
      checked: isChecked,
      click: () => {
        if (!isChecked) {
          myAutoLauncher.enable();
          settings.set("isChecked", true);
          isChecked = settings.get("isChecked");
        } else {
          myAutoLauncher.disable();
          settings.set("isChecked", false);
          isChecked = settings.get("isChecked");
        }
      },
    },
    {
      label: "Item2",
      type: "separator",
    },
    {
      label: "12H/24H",
      type: "normal",
      click: () => {
        win.webContents.send("AMPM");
      },
    },
    {
      label: "Item4",
      type: "separator",
    },
    {
      label: "Close",
      type: "normal",
      click: () => {
        win = null;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  if (pathExist) {
    if (settings.get("Positions.X")) {
      // Set the position from electron-settings
      win.setPosition(settings.get("Positions.X"), settings.get("Positions.Y"));
    }
  }

  // Win.show when document.ready
  ipcMain.on("ready", (event) => {
    win.show();
  });

  // Save the position when moved
  win.on("move", () => {
    // Set a var with the actual position
    var _Positions = win.getPosition();
    // Set the settings with the var
    settings.set("Positions", {
      X: _Positions[0],
      Y: _Positions[1],
    });
  });

  win.on("closed", () => {
    win = null;
  });
}
// Prevent multi Instance
app.requestSingleInstanceLock();

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
