# EAS (Expo Application Services) Setup Guide

This guide covers the complete EAS setup for CMDA Nigeria Mobile App.

## 1. EAS Build (Cloud Builds)

### Build Profiles

| Profile | Purpose | Distribution | Channel |
|---------|---------|--------------|---------|
| `development` | Dev builds with dev client | Internal | development |
| `preview` | Testing builds (APK) | Internal | preview |
| `production` | Store releases (AAB) | Store | production |

### Build Commands

```bash
# Development build (with dev client)
eas build --profile development --platform android

# Preview build (for internal testing)
eas build --profile preview --platform android

# Production build (for store release)
eas build --profile production --platform android

# Build for all platforms
eas build --profile production --platform all
```

---

## 2. EAS Update (OTA Updates)

Push JavaScript/asset updates instantly without rebuilding.

### Update Commands

```bash
# Push update to production channel
eas update --channel production --message "Bug fixes and improvements"

# Push update to preview channel
eas update --channel preview --message "New feature testing"

# Push update to development channel
eas update --channel development --message "Dev changes"

# Preview update before publishing
eas update --channel preview --auto
```

### Update Channels

- **production**: Live users get these updates
- **preview**: Internal testers get these updates
- **development**: Developers get these updates

---

## 3. CI/CD with GitHub Actions

The workflow (`.github/workflows/eas-build.yml`) provides:

### Automatic Triggers

- **Push to `main`**: Runs quality checks + OTA update to production
- **Push to `develop`**: Runs quality checks + OTA update to preview
- **Pull Request to `main`**: Runs quality checks only

### Manual Triggers (workflow_dispatch)

Go to GitHub Actions → EAS Build & Update → Run workflow:

1. **Platform**: android, ios, or all
2. **Profile**: development, preview, or production
3. **Update only**: Check for OTA-only (no native build)

### Required GitHub Secrets

Add these in your repo Settings → Secrets → Actions:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `EXPO_TOKEN` | EAS authentication | `eas login` then `eas whoami --token` |

---

## 4. Secrets & Environment Management

### EAS Secrets (Recommended for sensitive data)

```bash
# Create a secret
eas secret:create --scope project --name API_KEY --value "your-api-key"

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name API_KEY
```

### Environment Variables in eas.json

Already configured in `eas.json`:

```json
{
  "build": {
    "base": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://cmdabackend-38258a63fa98.herokuapp.com"
      }
    },
    "production": {
      "env": {
        "APP_ENV": "production"
      }
    }
  }
}
```

### Access in Code

```typescript
// Access environment variables
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const appEnv = process.env.APP_ENV;
```

---

## 5. EAS Diagnostics & Monitoring

### Diagnostics Commands

```bash
# Check project health
npx expo-doctor

# EAS diagnostics
eas diagnostics

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Cancel a build
eas build:cancel [BUILD_ID]
```

### Monitoring Setup

#### Sentry Integration (Recommended)

1. Install Sentry:
```bash
npx expo install @sentry/react-native
```

2. Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      ["@sentry/react-native/expo", {
        "organization": "your-org",
        "project": "cmda-mobile"
      }]
    ]
  }
}
```

3. Initialize in `App.tsx`:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.APP_ENV || 'development',
});
```

---

## Quick Reference

### Common Commands

```bash
# Login to EAS
eas login

# Check current user
eas whoami

# Initialize EAS in project
eas init

# Build Android APK
eas build -p android --profile preview

# Push OTA update
eas update --channel production

# Submit to Play Store
eas submit -p android --latest

# View all builds
eas build:list

# Run diagnostics
eas diagnostics
```

### Useful Links

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [EAS CLI Reference](https://docs.expo.dev/eas/cli/)

---

## Setup Checklist

- [ ] Run `eas login` and authenticate
- [ ] Add `EXPO_TOKEN` to GitHub Secrets
- [ ] Configure Apple credentials (for iOS): `eas credentials`
- [ ] Configure Google Play credentials (for Android)
- [ ] Test a preview build: `eas build --profile preview -p android`
- [ ] Test OTA update: `eas update --channel preview`
- [ ] Set up Sentry for error monitoring (optional)
