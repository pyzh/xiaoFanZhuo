var {app, BrowserWindow, autoUpdater} = require('electron');// 控制应用生命周期的模块。创建原生浏览器窗口的模块
var path = require('path');

// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
var mainWindow = null;

autoUpdater.setFeedURL('http://fanfoufan.com/download');

autoUpdater.on('update-not-available', function (info) {
    global.updater = {
        success: true,
        message: 'no-update-available'
    };
});
autoUpdater.on('checking-for-update', function (info) {
    global.updater = {
        success: true,
        message: 'checking-for-update'
    };
});
autoUpdater.on('update-available', function (info) {
    global.updater = {
        success: true,
        message: 'available'
    };
});
autoUpdater.on('update-downloaded', function (info) {
    global.updater = {
        success: true,
        message: 'downloaded'
    };
});
autoUpdater.on('error', function (info) {
    global.updater = {
        success: false,
        message: info
    };
});

var init = function(){
    autoUpdater.checkForUpdates();
    var windowStyle = {
        width: 500, 
        height: 640,
        autoHideMenuBar: true,
        backgroundColor: 'white',
        resizable: false
    };
    mainWindow = new BrowserWindow(windowStyle);

    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function(){
        mainWindow = null;
    });

    mainWindow.loadURL(path.join(__dirname, 'index.html'));
};

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function() {
    // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
    // 应用会保持活动状态
    if (process.platform != 'darwin') {
        app.quit();
    }
});
app.on('ready', init);

if (handleSquirrelEvent()) {
    return;
}

function handleSquirrelEvent () {
    if (process.argv.length === 1) {
        return false;
    }

    var ChildProcess = require('child_process');
    
    var appFolder = path.resolve(process.execPath, '..');
    var rootAtomFoler = path.resolve(appFolder, '..');
    var updateDotExe = path.resolve(path.join(rootAtomFoler, 'Update.exe'));
    var exeName = path.basename(process.execPath);

    var spawn = function (command, args) {
        var spawnedProcess;
        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (err) {
            console.log(err);
        }
        return spawnedProcess;
    }

    var spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    }

    var squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-uninstall':
            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
}