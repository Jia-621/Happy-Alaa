const { app, BrowserWindow, Menu, shell, screen, ipcMain, protocol, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// ============================================================
// Dedicated user data dir — avoids cache conflicts
// ============================================================
app.setPath('userData', path.join(__dirname, 'userdata'));

// ============================================================
// Privileged scheme (before app.whenReady!)
// ============================================================
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'alaa',
    privileges: {
      standard: true, secure: true,
      supportFetchAPI: true, corsEnabled: true, stream: true,
    }
  }
]);

const ROOT = path.resolve(__dirname, '..');

// ============================================================
// Custom protocol: alaa://a/ → files from ROOT
// ============================================================
function registerCustomProtocol() {
  protocol.handle('alaa', (request) => {
    let urlPath;
    try {
      const parsed = new URL(request.url);
      urlPath = decodeURIComponent(parsed.pathname);
    } catch (e) { return new Response('Bad URL', { status: 400 }); }

    if (urlPath.startsWith('/')) urlPath = urlPath.slice(1);
    if (urlPath.includes('..')) return new Response('Forbidden', { status: 403 });

    const filePath = path.join(ROOT, urlPath);
    const mimeMap = {
      '.html': 'text/html; charset=utf-8',
      '.js':   'application/javascript; charset=utf-8',
      '.mjs':  'application/javascript; charset=utf-8',
      '.css':  'text/css; charset=utf-8',
      '.png':  'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.gif':  'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
      '.json': 'application/json; charset=utf-8',
      '.mp3':  'audio/mpeg', '.wav': 'audio/wav',
      '.lrc':  'text/plain; charset=utf-8',
      '.webmanifest': 'application/json; charset=utf-8',
    };
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      return new Response(data, {
        status: 200,
        headers: { 'content-type': mimeType, 'cache-control': 'no-cache' }
      });
    } catch (err) {
      return new Response('', { status: 404 });
    }
  });
}

// ============================================================
// MULTILINGUAL MENU LABELS
// ============================================================
const L = {
  zh: {
    app: 'Happy Alaa', about: '关于 Happy Alaa', quit: '退出 Happy Alaa',
    langMenu: '语言 | Lang',
    chinese: '中文', english: 'English', arabic: 'عربي',
    desktopAlaa: '桌面Alaa',
    webVersion: '在线版',
    // Pet right-click menu
    openGame: '打开游戏 🎮',
    minimize: '缩放至最小 🔽',
    switchState: '切换状态 🔄',
    eating: '吃东西 🍽️',
    coffee: '咖啡', cherry: '樱桃', dragonFruit: '火龙果',
    strawberry: '草莓', grapes: '葡萄', watermelon: '西瓜',
    normal: '普通', happy: '开心', good: '不错', bigHappy: '超开心',
    drowsy: '犯困',
    sleep: '睡觉 😴',
  },
  en: {
    app: 'Happy Alaa', about: 'About Happy Alaa', quit: 'Exit Happy Alaa',
    langMenu: 'Language | Lang',
    chinese: '中文', english: 'English', arabic: 'عربي',
    desktopAlaa: 'Desktop Alaa',
    webVersion: 'Web Version',
    openGame: 'Open Game 🎮',
    minimize: 'Minimize 🔽',
    switchState: 'Switch State 🔄',
    eating: 'Eat 🍽️',
    coffee: 'Coffee', cherry: 'Cherry', dragonFruit: 'Dragon Fruit',
    strawberry: 'Strawberry', grapes: 'Grapes', watermelon: 'Watermelon',
    normal: 'Normal', happy: 'Happy', good: 'Good', bigHappy: 'Big Happy',
    drowsy: 'Sleepy',
    sleep: 'Sleep 😴',
  },
  ar: {
    app: 'Happy Alaa', about: 'حول Happy Alaa', quit: 'خروج',
    langMenu: 'اللغة | Lang',
    chinese: '中文', english: 'English', arabic: 'عربي',
    desktopAlaa: 'علاء المكتب',
    webVersion: 'النسخة الإلكترونية',
    openGame: 'افتح اللعبة 🎮',
    minimize: 'تصغير 🔽',
    switchState: 'تغيير الحالة 🔄',
    eating: 'أكل 🍽️',
    coffee: 'قهوة', cherry: 'كرز', dragonFruit: 'فاكهة التنين',
    strawberry: 'فراولة', grapes: 'عنب', watermelon: 'بطيخ',
    normal: 'عادي', happy: 'سعيد', good: 'جيد', bigHappy: 'سعيد جداً',
    drowsy: 'نعسان',
    sleep: 'نوم 😴',
  }
};

// ============================================================
// WINDOW STATE
// ============================================================
let mainWin = null;
let petWin = null;
let tray = null;
let isQuitting = false;
let menuLang = 'ar'; // Menu defaults to Arabic

// ============================================================
// BUILD MENU TEMPLATE (multilingual)
// ============================================================
function buildMenuTemplate(lang) {
  const T = L[lang] || L.ar;
  return [
    {
      label: T.app,
      submenu: [
        { label: T.about, click: () => showAboutWindow() },
        { type: 'separator' },
        {
          label: T.quit,
          click: () => { isQuitting = true; app.quit(); }
        }
      ]
    },
    {
      label: T.langMenu,
      submenu: [
        {
          label: T.chinese,
          click: () => switchLang('zh')
        },
        {
          label: T.english,
          click: () => switchLang('en')
        },
        {
          label: T.arabic,
          click: () => switchLang('ar')
        }
      ]
    },
    {
      label: T.desktopAlaa,
      click: () => {
        if (mainWin) mainWin.hide();
        ensurePetWindow();
      }
    },
    {
      label: T.webVersion,
      click: () => shell.openExternal('https://jia-621.github.io/Happy-Alaa/')
    }
  ];
}

function rebuildMenu(lang) {
  menuLang = lang;
  const menu = Menu.buildFromTemplate(buildMenuTemplate(lang));
  Menu.setApplicationMenu(menu);
}

function switchLang(lang) {
  rebuildMenu(lang);
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.executeJavaScript(`setLang("${lang}")`);
  }
}

// ============================================================
// ABOUT WINDOW
// ============================================================
function showAboutWindow() {
  const T = L[menuLang] || L.ar;

  const aboutHTML = {
    ar: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>
      body{font-family:'Segoe UI',sans-serif;padding:24px;color:#4A3728;background:#FFF8E7;line-height:1.8;direction:rtl;text-align:right;}
      h1{font-size:22px;text-align:center;color:#FF6B6B;}h3{color:#FF6B6B;margin-top:20px;}p{margin:6px 0;}
</style></head><body>
<h1>🎀 الاء السعيدة</h1>
<p style="text-align:center">لعبة تفاعلية عاطفية دافئة + علاء المكتب</p>
<h3>الأوضاع العاطفية</h3>
<h3>علاء المكتب</h3>
<h3>الميزات</h3>
<p>👗 خزانة ملابس · 🎵 مكتبة موسيقى · 📝 مذكرات · 👑 معرض صور · 🌐 ثلاث لغات · 🔑 حساب Supabase</p>
<h3>كيفية التشغيل</h3>
<p><b>سطح المكتب:</b> Happy Alaa.lnk | <b>الويب:</b> jia-621.github.io/Happy-Alaa</p>
<h3>التقنيات</h3>
<p>HTML/CSS/JS · Electron 33 · Capacitor · Supabase · PWA</p>
</body></html>`,

    zh: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
      body{font-family:'PingFang SC','Microsoft YaHei',sans-serif;padding:24px;color:#4A3728;background:#FFF8E7;line-height:1.8;}
      h1{font-size:22px;text-align:center;color:#FF6B6B;}h3{color:#FF6B6B;margin-top:20px;}p{margin:6px 0;}
</style></head><body>
<h1>🎀 Happy Alaa — 开心阿拉</h1>
<p style="text-align:center">一个温馨的情感互动游戏 + 桌面Alaa</p>
<h3>四种情绪模式</h3>
<h3>桌面Alaa</h3>
<h3>其他功能</h3>
<p>👗 衣橱柜 · 🎵 音乐库 · 📝 日记 · 👑 公主Alaa · 🌐 三语 · 🔑 账号系统</p>
<h3>如何运行</h3>
<p><b>桌面版:</b> Happy Alaa.lnk | <b>网络版:</b> jia-621.github.io/Happy-Alaa</p>
<h3>技术栈</h3>
<p>HTML/CSS/JS · Electron 33 · Capacitor · Supabase · PWA</p>
</body></html>`,

    en: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
      body{font-family:'Segoe UI',sans-serif;padding:24px;color:#4A3728;background:#FFF8E7;line-height:1.8;}
      h1{font-size:22px;text-align:center;color:#FF6B6B;}h3{color:#FF6B6B;margin-top:20px;}p{margin:6px 0;}
</style></head><body>
<h1>🎀 Happy Alaa</h1>
<p style="text-align:center">A Heartwarming Emotion Interactive Game + Desktop Alaa</p>
<h3>Four Emotion Modes</h3>
<h3>Desktop Alaa</h3>
<h3>Features</h3>
<p>👗 Wardrobe · 🎵 Music · 📝 Diary · 👑 Gallery · 🌐 Trilingual · 🔑 Supabase</p>
<h3>How to Run</h3>
<p><b>Desktop:</b> Happy Alaa.lnk | <b>Web:</b> jia-621.github.io/Happy-Alaa</p>
<h3>Tech Stack</h3>
<p>HTML/CSS/JS · Electron 33 · Capacitor · Supabase · PWA</p>
</body></html>`
  };

  const html = aboutHTML[menuLang] || aboutHTML.ar;
  const aboutWin = new BrowserWindow({
    width: 420, height: 620,
    resizable: false,
    title: T.about,
    icon: path.join(ROOT, 'icon-192.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  aboutWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  aboutWin.setMenu(null);
}

// ============================================================
// PET CONTEXT MENU (multilingual)
// ============================================================
function showPetContextMenu() {
  if (!petWin || petWin.isDestroyed()) return;
  const T = L[menuLang] || L.ar;

  // Helper: execute JS in pet window
  const petExec = (code) => {
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.executeJavaScript(code);
    }
  };

  Menu.buildFromTemplate([
    {
      label: T.openGame,
      click: () => createMainWindow()
    },
    {
      label: T.minimize,
      click: () => minimizePetToTray()
    },
    { type: 'separator' },
    {
      label: T.switchState,
      submenu: [
        { label: T.normal + ' 👋',          click: () => petExec('switchSprite("normal")') },
        { label: T.happy + ' 😊',           click: () => petExec('switchSprite("happy")') },
        { label: T.good + ' 👍',            click: () => petExec('switchSprite("good")') },
        { label: T.drowsy + ' 🐼',          click: () => petExec('switchSprite("happiness")') },
        { label: T.bigHappy + ' 🎉',        click: () => petExec('switchSprite("bigHappiness")') },
      ]
    },
    {
      label: T.eating,
      submenu: [
        { label: T.coffee + ' ☕',           click: () => petExec('eatFood("☕")') },
        { label: T.cherry + ' 🍒',           click: () => petExec('eatFood("🍒")') },
        { label: T.dragonFruit + ' 🐉',      click: () => petExec('eatFood("🐉")') },
        { label: T.strawberry + ' 🍓',       click: () => petExec('eatFood("🍓")') },
        { label: T.grapes + ' 🍇',           click: () => petExec('eatFood("🍇")') },
        { label: T.watermelon + ' 🍉',       click: () => petExec('eatFood("🍉")') },
      ]
    },
    { type: 'separator' },
    {
      label: T.sleep,
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]).popup();
}

// ============================================================
// MAIN GAME WINDOW
// ============================================================
function createMainWindow() {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.show();
    mainWin.focus();
    return;
  }

  mainWin = new BrowserWindow({
    width: 430, height: 850,
    minWidth: 380, minHeight: 600,
    icon: path.join(ROOT, 'icon-192.png'),
    title: 'Happy Alaa - 开心阿拉',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWin.loadURL('alaa://a/game.html');

  // Build menu in current language
  rebuildMenu(menuLang);

  // Close: minimize to pet only if pet is already active
  mainWin.on('close', (e) => {
    if (!isQuitting && petWin && !petWin.isDestroyed()) {
      e.preventDefault();
      mainWin.hide();
    }
  });

  mainWin.on('closed', () => { mainWin = null; });
}

// ============================================================
// DESKTOP PET WINDOW
// ============================================================
function ensurePetWindow() {
  if (petWin && !petWin.isDestroyed()) return;

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const pw = 130, ph = 150;

  petWin = new BrowserWindow({
    width: pw, height: ph,
    x: sw - pw - 20, y: sh - ph - 10,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    skipTaskbar: true, hasShadow: false,
    icon: path.join(ROOT, 'icon-192.png'),
    title: 'Alaa',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  petWin.loadURL('alaa://a/desktop/pet.html');

  // Right-click context menu
  petWin.webContents.on('context-menu', () => showPetContextMenu());

  petWin.on('closed', () => {
    petWin = null;
    if (tray) { tray.destroy(); tray = null; }
  });
}

// ============================================================
// SYSTEM TRAY — minimize pet to notification area
// ============================================================
function minimizePetToTray() {
  if (!petWin || petWin.isDestroyed()) return;

  petWin.hide();

  // Create tray icon if not exists
  if (!tray || tray.isDestroyed()) {
    const iconPath = path.join(ROOT, 'icon-192.png');
    const icon = nativeImage.createFromPath(iconPath);
    const trayIcon = icon.resize({ width: 16, height: 16 });
    tray = new Tray(trayIcon);
    tray.setToolTip('Alaa - 桌面宠物');
    tray.on('click', () => {
      // Restore pet from tray
      if (petWin && !petWin.isDestroyed()) {
        petWin.show();
        petWin.focus();
      } else {
        ensurePetWindow();
      }
      if (tray) { tray.destroy(); tray = null; }
    });
    // Right-click tray: quit option
    tray.on('right-click', () => {
      Menu.buildFromTemplate([
        {
          label: L[menuLang]?.openGame || 'Open Game',
          click: () => createMainWindow()
        },
        {
          label: L[menuLang]?.sleep || 'Quit',
          click: () => { isQuitting = true; app.quit(); }
        }
      ]).popup();
    });
  }
}

// ============================================================
// IPC
// ============================================================
ipcMain.on('open-game', () => createMainWindow());
ipcMain.on('pet-context-menu', () => showPetContextMenu());

// ============================================================
// APP LIFECYCLE
// ============================================================
app.whenReady().then(() => {
  registerCustomProtocol();
  createMainWindow();
  // Pet only appears when user clicks "桌面Alaa" menu
});

app.on('window-all-closed', () => { app.quit(); });

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
  if (tray) { tray.destroy(); tray = null; }
});
