@echo off
title GatePass USB Mobile Installer
color 0B
echo ================================================================
echo       GatePass Mobile App - 1-Click USB Phone Installer
echo ================================================================
echo.
echo Make sure your Android mobile phone is connected via USB cable
echo with "USB Debugging" turned ON in Developer Options.
echo.
pause

echo.
echo Searching for connected Android phone via ADB...
where adb >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ADB not found in system PATH.
    echo.
    echo If your phone is connected, you can also install directly by:
    echo 1. Opening "Install_GatePass_On_Mobile.html"
    echo 2. Or scanning the QR Code on your mobile camera!
    echo.
    start "" "%~dp0Install_GatePass_On_Mobile.html"
    pause
    exit /b
)

echo Checking ADB devices...
adb devices
echo.
echo Installing GatePass.apk to your mobile device...
adb install -r "%~dp0GatePass.apk"
if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo   SUCCESS! GatePass has been installed on your mobile phone!
    echo ================================================================
    echo Opening GatePass on your phone...
    adb shell monkey -p com.gatepass.app -c android.intent.category.LAUNCHER 1
) else (
    echo.
    echo [!] Installation via USB failed or phone not detected.
    echo Opening Web Installer so you can install via direct tap or QR code...
    start "" "%~dp0Install_GatePass_On_Mobile.html"
)
pause

