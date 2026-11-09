@echo off
rem Build debug APK without Android Studio. Tools live in C:\wooj\android-tools
rem (temp and Gradle folders too, to avoid the non-ASCII user profile path)
set JAVA_HOME=C:\wooj\android-tools\jdk
set TMP=C:\wooj\android-tools\tmp
set TEMP=C:\wooj\android-tools\tmp
set ANDROID_USER_HOME=C:\wooj\android-tools\.android
set GRADLE_USER_HOME=C:\wooj\android-tools\gradle
set JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=C:\wooj\android-tools\tmp -Dfile.encoding=UTF-8
cd /d %~dp0
call "%~dp0gradlew.bat" assembleDebug --no-daemon -q || exit /b 1
echo APK: %~dp0app\build\outputs\apk\debug\app-debug.apk
