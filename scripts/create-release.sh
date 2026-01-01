#!/bin/bash

# CMDA Mobile App Release Script
# This script helps you create a new release with GitHub

set -e

echo "🚀 CMDA Mobile App Release Creator"
echo "===================================="
echo ""

# Check if version is provided
if [ -z "$1" ]; then
  echo "❌ Error: Version number required"
  echo "Usage: ./scripts/create-release.sh <version>"
  echo "Example: ./scripts/create-release.sh 1.0.0"
  exit 1
fi

VERSION=$1
TAG="v$VERSION"

echo "📱 Creating release for version: $VERSION"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "⚠️  GitHub CLI (gh) is not installed"
  echo "Please install it from: https://cli.github.com/"
  echo ""
  echo "Or use the GitHub Actions workflow instead:"
  echo "1. Go to: https://github.com/Dickson-Hardy/cmda-backend/actions"
  echo "2. Select 'Mobile App Release' workflow"
  echo "3. Click 'Run workflow'"
  echo "4. Enter version: $VERSION"
  exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
  echo "🔐 Please login to GitHub CLI first:"
  gh auth login
fi

echo "🏗️  Building Android APK with EAS..."
eas build --platform android --profile production --non-interactive --wait

echo ""
echo "📥 Downloading APK..."
BUILD_URL=$(eas build:list --platform android --limit 1 --json | jq -r '.[0].artifacts.buildUrl')

if [ -z "$BUILD_URL" ] || [ "$BUILD_URL" = "null" ]; then
  echo "❌ Error: Could not get build URL"
  exit 1
fi

APK_FILE="cmda-mobile-v$VERSION.apk"
curl -L -o "$APK_FILE" "$BUILD_URL"

echo ""
echo "✅ APK downloaded: $APK_FILE"
echo ""

# Create release notes
RELEASE_NOTES="## CMDA Nigeria Mobile App v$VERSION

### Download
- **Android**: Download the APK file below
- **iOS**: Coming soon

### Installation
**Android:**
1. Download the APK file
2. Enable \"Install from Unknown Sources\" in your device settings
3. Open the APK file to install

### What's New
- Bug fixes and performance improvements
- Latest features from the CMDA platform

---
Built with Expo EAS Build"

echo "📝 Creating GitHub Release..."
gh release create "$TAG" \
  "$APK_FILE" \
  --title "CMDA Mobile v$VERSION" \
  --notes "$RELEASE_NOTES" \
  --repo Dickson-Hardy/cmda-backend

echo ""
echo "✅ Release created successfully!"
echo ""
echo "📱 Download URL:"
echo "https://github.com/Dickson-Hardy/cmda-backend/releases/download/$TAG/$APK_FILE"
echo ""
echo "🔗 Latest release URL (always points to newest):"
echo "https://github.com/Dickson-Hardy/cmda-backend/releases/latest/download/cmda-mobile.apk"
echo ""
echo "🎉 Done! Users can now download the app from GitHub Releases"
