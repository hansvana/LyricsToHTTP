const { app, BrowserWindow, ipcMain } = require('electron');
const Config = require('electron-config');
const config = new Config();
const path = require('path');
const httpServer = require('./express');
require('dotenv').config();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('control-message', (event, arg) => {
  httpServer.emit(arg);
})

ipcMain.on('line', (event, arg) => {
  httpServer.emit({ title: 'line', message: arg });
})

console.log(app.getPath('userData'));