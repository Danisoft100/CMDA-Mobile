# Mobile App Release Guide

## How to Create a New Release

### Option 1: Using GitHub Actions (Automated)

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select **Mobile App Release** workflow
4. Click **Run workflow**
5. Fill in the details:
   - **Version**: e.g., `1.0.0`, `1.0.1`, `2.0.0`
   - **Platform**: Choose `android`, `ios`, or `all`
6. Click **Run workflow**

The workflow will:
- Build your app using EAS
- Download the APK/IPA
- Create a GitHub Release
- Upload the files to the release

### Option 2: Manual Release

If you prefer to do it manually:

```bash
# 1. Navigate to mobile directory
cd CMDA-Mobile

# 2. Build with EAS
eas build --platform android --profile production

# 3. Wait for build to complete and download the APK
# The build URL will be shown in the terminal

# 4. Create a GitHub release manually
# - Go to GitHub > Releases > Create new release
# - Upload the downloaded APK
# - Tag it with version number (e.g., v1.0.0)
```

## Download URLs

After creating a release, your APK will be available at:

### Latest Release (Always points to newest)
```
https://github.com/Dickson-Hardy/cmda-backend/releases/latest/download/cmda-mobile.apk
```

### Specific Version
```
https://github.com/Dickson-Hardy/cmda-backend/releases/download/v1.0.0/cmda-mobile-v1.0.0.apk
```

## Frontend Integration

The frontend is already configured to use GitHub Releases:

```javascript
// CMDA-Frontend/src/components/Global/AppDownloadBanner/AppDownloadBanner.jsx
const apkUrl = "https://github.com/Dickson-Hardy/cmda-backend/releases/latest/download/cmda-mobile.apk";
```

This URL automatically points to the latest release, so you don't need to update the frontend code for each new version.

## DigitalOcean App Platform

Your backend is deployed on DigitalOcean App Platform, but the APK is now hosted on GitHub Releases instead of being served from the backend. This is better because:

- ✅ No large files in your Git repository
- ✅ No large files in your Docker image
- ✅ Free hosting via GitHub
- ✅ Automatic CDN distribution
- ✅ Version history and rollback capability

## Alternative: DigitalOcean Spaces

If you prefer to use DigitalOcean for hosting the APK:

1. **Create a Space:**
   - Go to DigitalOcean Dashboard
   - Create a new Space (like AWS S3)
   - Make it publicly accessible

2. **Upload APK:**
   ```bash
   # Install s3cmd or use the web interface
   s3cmd put cmda-mobile.apk s3://your-space-name/downloads/
   ```

3. **Update Frontend URL:**
   ```javascript
   const apkUrl = "https://your-space-name.nyc3.digitaloceanspaces.com/downloads/cmda-mobile.apk";
   ```

**Cost:** $5/month for 250GB storage + 1TB transfer

## Troubleshooting

### Build fails in GitHub Actions
- Check that `EXPO_TOKEN` secret is set in GitHub repository settings
- Verify EAS credentials are configured: `eas credentials`

### APK download returns 404
- Ensure the release was created successfully
- Check that the APK was uploaded to the release
- Verify the filename matches in the URL

### Users can't install APK
- Android users need to enable "Install from Unknown Sources"
- Consider publishing to Google Play Store for easier distribution

## Publishing to App Stores

### Google Play Store
```bash
eas submit --platform android --latest
```

### Apple App Store
```bash
eas submit --platform ios --latest
```

You'll need to configure store credentials first:
```bash
eas credentials
```
