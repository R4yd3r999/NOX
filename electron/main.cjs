const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// Sin menú superior clásico (File/Edit/View...) — se siente más como app nativa moderna
Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 420,
    minHeight: 600,
    backgroundColor: "#08080a",
    show: false, // evita el flash blanco al abrir
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.png"),
    // Barra de título integrada al tema (Windows 10/11): mantiene minimizar/
    // maximizar/cerrar nativos pero coloreados acorde a la interfaz.
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0c0c0e",
      symbolColor: "#e5e0dd",
      height: 38,
    },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
