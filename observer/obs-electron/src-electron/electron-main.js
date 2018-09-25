const fs = require('fs');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const electron_url = require('url');
const log = require('electron-log');
const {ipcMain} = require('electron');

const autoUpdater = require('electron-updater').autoUpdater;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

const isSecondInstance = app.makeSingleInstance(
  (commandLine, workingDirectory) => {
    // Tried to run a second instance, we should focus our window instead:
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  }
);

if (isSecondInstance) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: electron_url.format({
      pathname: path.join(__dirname, '../build/icon.ico'),
      protocol: 'file:',
      slashes: true
    })
  });

  win.setFullScreen(true);
  win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(
    electron_url.format({
      pathname: path.join(__dirname, '../build/obs-electron/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open the DevTools.
  // win.webContents.openDevTools();
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('checking-for-update');
  // sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('update-available');
  // sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('update-not-available');
  // sendStatusToWindow('Software is up to date.');
});
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('error-auto-updater');
  // Commonly caused by offline/ off VPN
  // sendStatusToWindow('Error in auto-updater.');
});
autoUpdater.on('download-progress', (ev, progressObj) => {
  // TODO show progress bar?
  //sendStatusToWindow('Download progress...');
});
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('update-downloaded');
  // sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000);
});

// SSL/TLS: this is the self signed certificate support
// https://stackoverflow.com/questions/38986692/how-do-i-trust-a-self-signed-certificate-from-an-electron-app
app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
  }
);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();
  sendStatusToWindow(' * READY *');
  // Handle autoupdate via electron-updater
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('close-app', () => {
  app.quit();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
