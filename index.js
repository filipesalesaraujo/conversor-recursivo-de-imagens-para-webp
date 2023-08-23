const { app, BrowserWindow } = require('electron');
require('@electron/remote/main').initialize();

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#000',
        webPreferences: {
            enableRemoteModule: true,
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');

    require('@electron/remote/main').enable(win.webContents);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
