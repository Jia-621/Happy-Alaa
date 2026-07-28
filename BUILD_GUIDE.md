# Happy Alaa - Mobile App Build Guide

## 📱 Method 1: PWA (Instant — works on both Android & iOS)

1. Upload the entire "Happy Alaa" folder to any web server (GitHub Pages, Netlify, etc.)
2. Open the game URL on your phone in Chrome/Safari
3. **Android**: Chrome will show "Install app" banner, or tap ⋮ → Add to Home Screen
4. **iOS**: Safari → Share button → Add to Home Screen
5. The game will install as a standalone app with its own icon!

## 🤖 Method 2: Android APK (using Capacitor)

### Prerequisites:
- Install Node.js from https://nodejs.org
- Install Android Studio from https://developer.android.com/studio

### Steps:
```bash
# 1. Install Capacitor CLI
npm install -g @capacitor/cli @capacitor/core @capacitor/android

# 2. In the game directory, init Capacitor
cd "D:\桌面\Happy Alaa"
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Happy Alaa" "com.happyalaa.game"

# 3. Copy game files to www
mkdir www
xcopy /E /I . www
# (exclude node_modules and www itself)

# 4. Add Android platform
npx cap add android

# 5. Build APK
npx cap copy android
npx cap open android
# Then in Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## 🍎 Method 3: iOS (requires Mac + Xcode)

```bash
npm install @capacitor/ios
npx cap add ios
npx cap copy ios
npx cap open ios
# Then in Xcode: Product → Archive → Distribute App
```

## 🪟 Method 4: Windows (already done!)
Double-click "Happy Alaa.hta" on your desktop!
