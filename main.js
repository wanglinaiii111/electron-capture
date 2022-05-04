const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const { useCapture } = require('./lib/capture-main');
const path = require('path');
const remote = require('@electron/remote/main');
remote.initialize();

let win = null;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true, //允许使用node api'
            contextIsolation: false, //上下文隔离
        },
    });

    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();

    remote.enable(win.webContents);
}

//最小化
ipcMain.on('window-minimize', function () {
    win.minimize();
});

//还原窗口
ipcMain.on('window-minimize', function () {
    win.restore();
});

app.whenReady().then(() => {
    // 初始化截图
    createWindow();
    useCapture(win);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    // 注销所有快捷键
    globalShortcut.unregisterAll();
});
