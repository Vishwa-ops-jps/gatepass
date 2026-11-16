@echo off
title GatePass Mobile Wi-Fi Installer
color 0A
echo ================================================================
echo       GatePass Mobile Wi-Fi Direct APK Installer
echo ================================================================
echo.
echo Make sure your mobile phone is connected to the same Wi-Fi.
echo.
echo Open Chrome on your Android mobile phone and type:
echo.
echo     http://192.168.1.8:8080/GatePass.apk
echo.
echo Or open:
echo     http://192.168.1.8:8080/Install_GatePass_On_Mobile.html
echo.
echo ================================================================
echo Server is running... Keep this window open while downloading!
echo ================================================================
python -m http.server 8080 --directory "%~dp0"
pause
