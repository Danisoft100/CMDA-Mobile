@echo off
REM CMDA Mobile App Release Script for Windows
REM This script helps you create a new release with GitHub

echo.
echo 🚀 CMDA Mobile App Release Creator
echo ====================================
echo.

if "%1"=="" (
  echo ❌ Error: Version number required
  echo Usage: scripts\create-release.bat ^<version^>
  echo Example: scripts\create-release.bat 1.0.0
  exit /b 1
)

set VERSION=%1
set TAG=v%VERSION%

echo 📱 Creating release for version: %VERSION%
echo.

REM Check if gh CLI is installed
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ⚠️  GitHub CLI ^(gh^) is not installed
  echo Please install it from: https://cli.github.com/
  echo.
  echo Or use the GitHub Actions workflow instead:
  echo 1. Go to: https://github.com/Dickson-Hardy/cmda-backend/actions
  echo 2. Select 'Mobile App Release' workflow
  echo 3. Click 'Run workflow'
  echo 4. Enter version: %VERSION%
  exit /b 1
)

REM Check if logged in to GitHub
gh auth status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo 🔐 Please login to GitHub CLI first:
  gh auth login
)

echo 🏗️  Building Android APK with EAS...
call eas build --platform android --profile production --non-interactive --wait

echo.
echo 📥 Getting build URL...
for /f "delims=" %%i in ('eas build:list --platform android --limit 1 --json') do set BUILD_JSON=%%i

REM Note: This requires jq or manual extraction. For simplicity, we'll show instructions
echo.
echo ⚠️  Manual step required:
echo 1. Run: eas build:list --platform android --limit 1
echo 2. Copy the build URL
echo 3. Download the APK manually
echo 4. Rename it to: cmda-mobile-v%VERSION%.apk
echo 5. Create release with: gh release create %TAG% cmda-mobile-v%VERSION%.apk --title "CMDA Mobile v%VERSION%" --notes "Release notes here"
echo.
echo Or use the GitHub Actions workflow for fully automated releases!
echo.

pause
