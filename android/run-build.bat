@echo off
set JAVA_HOME=G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\jdk17\jdk-17.0.19+10
set ANDROID_HOME=G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\android-sdk
set ANDROID_SDK_ROOT=G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\android-sdk
set GRADLE_USER_HOME=G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\android\.gradle-home
cd /d "G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\android"
"%JAVA_HOME%\bin\java.exe" -Dorg.gradle.appname=gradlew -classpath "gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain :app:assembleDebug --no-daemon --offline --no-build-cache --stacktrace > "G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\android\build-output.log" 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> "G:\2026-5-21\AI掌纹1 - (codbuddy)\app_rn\android\build-output.log"
