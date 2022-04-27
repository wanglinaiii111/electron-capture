const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const { useCapture } = require("./lib/capture-main");
const remote = require("@electron/remote/main")
remote.initialize()

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, //允许使用node api'
      contextIsolation: false, //上下文隔离
    },
  });

  win.loadURL("http://localhost:3000");
  // win.webContents.openDevTools();
  //使用IPC实现主进程和渲染进程之间进行通信
  ipcMain.on("message", (event, arg) => {
    console.log(arg);
    event.sender.send("reply", "收到了");
  });
  remote.enable(win.webContents)
  //
  //   ipcMain.on("capture-screen", captureScreen);
  // const winSecond = new BrowserWindow({
  //     width: 300,
  //     height: 300,
  //     webPreferences: {
  //         nodeIntegration: true,
  //         contextIsolation:false
  //     },
  //     parent: win //设置父级窗口，当关闭父窗口时，子窗口也关闭
  // })

  // winSecond.loadFile('second.html')
}

app.whenReady().then(() => {
  console.log(99999999999);
  // 初始化截图
  useCapture();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  //   //注册快捷键-截屏
  //   const ret = globalShortcut.register("shift+P", captureScreen);

  //   if (!ret) {
  //     console.log("registration failed");
  //   }

  //   // 检查快捷键是否注册成功
  //   console.log(globalShortcut.isRegistered("CommandOrControl+X"));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  // 注销所有快捷键
  globalShortcut.unregisterAll();
});
