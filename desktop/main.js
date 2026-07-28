const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWin = null;

function createWindow() {
  mainWin = new BrowserWindow({
    width: 430,
    height: 850,
    minWidth: 380,
    minHeight: 600,
    icon: path.join(__dirname, '..', 'game-icon.ico'),
    title: 'Happy Alaa - 开心阿拉',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the game
  mainWin.loadFile(path.join(__dirname, '..', 'game.html'));

  // Build menu
  const menuTemplate = [
    {
      label: 'Happy Alaa',
      submenu: [
        { label: '关于 Happy Alaa', enabled: false },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { role: 'resetZoom', label: '重置缩放' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '在线版',
          click: () => shell.openExternal('https://jia-621.github.io/Happy-Alaa/')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWin.on('closed', () => { mainWin = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
