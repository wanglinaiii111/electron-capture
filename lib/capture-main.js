/**
 * Created by xujian1 on 2018/10/5.
 */

const { BrowserWindow, ipcMain, globalShortcut } = require('electron');
const os = require('os');
const path = require('path');
const remote = require('@electron/remote/main');

let captureWins = [];
let captureType = null;

const captureScreen = (e, args) => {
    if (os.platform() === 'darwin') {
        const { hasScreenCapturePermission, openSystemPreferences } = require('mac-screen-capture-permissions');

        let permissions = hasScreenCapturePermission();
        if (!permissions) {
            openSystemPreferences()
                .then((r) => {
                    console.log(r);
                })
                .catch((e) => {
                    console.log(1, e);
                });
        }
    }

    if (captureWins.length) {
        return;
    }
    const { screen } = require('electron');

    let displays = screen.getAllDisplays();

    captureWins = displays.map((display) => {
        let captureWin = new BrowserWindow({
            // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
            fullscreen: os.platform() === 'win32' || undefined,
            width: display.bounds.width,
            height: display.bounds.height,
            x: display.bounds.x,
            y: display.bounds.y,
            transparent: true,
            // backgroundColor:'#asdadww',
            frame: false,
            // skipTaskbar: true,
            // autoHideMenuBar: true,
            movable: false,
            resizable: false,
            enableLargerThanScreen: true,
            hasShadow: false,
            webPreferences: {
                nodeIntegration: true, //允许使用node api'
                contextIsolation: false, //上下文隔离
            },
        });
        captureWin.setAlwaysOnTop(true, 'screen-saver');
        captureWin.setVisibleOnAllWorkspaces(true);
        captureWin.setFullScreenable(false);
        captureWin.webContents.send('capture-screen', { type: captureType });
        captureWin.loadFile(path.join(__dirname, 'capture.html'));
        remote.enable(captureWin.webContents);

        let { x, y } = screen.getCursorScreenPoint();
        if (x >= display.bounds.x && x <= display.bounds.x + display.bounds.width && y >= display.bounds.y && y <= display.bounds.y + display.bounds.height) {
            captureWin.focus();
        } else {
            captureWin.blur();
        }
        // 调试用
        // captureWin.openDevTools();

        captureWin.on('closed', () => {
            let index = captureWins.indexOf(captureWin);
            if (index !== -1) {
                captureWins.splice(index, 1);
            }
            captureWins.forEach((win) => win.close());
        });
        return captureWin;
    });
};

const useCapture = (win) => {
    globalShortcut.register('Esc', () => {
        console.log('ESC 退出截屏');
        if (captureWins) {
            captureWins.forEach((win) => win.close());
            captureWins = [];
        }
    });

    //原生方式
    const screenShot = () => {
        if (os.platform() === 'darwin') {
            const child_process = require('child_process');
            child_process.exec(`screencapture -i -c`, (error, stdout, stderr) => {
                console.log('308', error);
                if (!error) {
                    //截图完成，在粘贴板中
                }
            });
        } else {
            return new Promise((resolve) => {
                const { execFile } = require('child_process');
                const path = require('path');
                var screenWin = execFile(path.join(__dirname, './assets/PrScrn.exe'));
                screenWin.on('exit', function (code) {
                    let pngs = require('electron').clipboard.readImage().toPNG();
                    let imgData = new Buffer.from(pngs, 'base64');
                    let imgs = 'data:image/png;base64,' + btoa(new Uint8Array(imgData).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                    resolve(imgs);
                });
            });
        }
    };

    globalShortcut.register('shift+P', captureScreen);
    // globalShortcut.register('shift+P', screenShot);

    //屏幕截图的三种方式
    ipcMain.on('capture-screen', (e, { type } = {}) => {
        captureType = type;
        if (type === 'img') {
            captureScreen();
        } else if (type === 'origin') {
            screenShot();
        } else if (type === 'video') {
            captureScreen();
        }
    });

    ipcMain.on('capture-screen-status', (e, { type = 'start', screenId } = {}) => {
        if (type === 'start') {
            captureScreen();
        } else if (type === 'complete') {
            // nothing
        } else if (type === 'select') {
            captureWins.forEach((win) => win.webContents.send('capture-screen-status', { type: 'select', screenId }));
        }
    });
};

exports.useCapture = useCapture;
