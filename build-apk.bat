@echo off
chcp 65001 >nul
echo ========================================
echo   Happy Alaa - Android APK Builder
echo ========================================
echo.
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Please install JDK 17+.
    echo https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)
echo [OK] Java found

echo.
echo Step 1: Syncing web assets...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Sync failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed. You may need to install Android SDK.
    echo Install Android Studio: https://developer.android.com/studio
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   APK BUILD SUCCESS!
echo   APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.
echo Install this APK on your Android phone to play!
pause
