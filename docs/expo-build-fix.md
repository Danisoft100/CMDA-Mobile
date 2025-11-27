# Expo Android Build Fix

## Issue
EAS/Gradle builds fail with compilation error:
```
error: cannot find symbol
import expo.core.ExpoModulesPackage;
```

## Root Cause
Expo SDK 53 and 54 have a namespace mismatch in the `expo` module:
- **Gradle namespace declaration:** `expo.core` (in `node_modules/expo/android/build.gradle`)
- **Actual Kotlin package:** `expo.modules` (in `node_modules/expo/android/src/main/java/expo/modules/`)

The autolinking system uses the namespace to generate imports, causing:
```java
import expo.core.ExpoModulesPackage;  // ❌ Doesn't exist
```

Instead of:
```java
import expo.modules.ExpoModulesPackage;  // ✅ Correct
```

## Solution Applied
Added a Gradle hook in `android/app/build.gradle` that patches the generated `PackageList.java` before Java compilation:
- Replaces `import expo.core.ExpoModulesPackage;` with `import expo.modules.ExpoModulesPackage;`
- Runs automatically during build process
- Works in local builds and EAS

## SDK Upgrade History
- ✅ Upgraded from Expo SDK 53.0.24 → 54.0.25
- ❌ Issue persists in SDK 54 (namespace still `expo.core`)
- ✅ Workaround required until Expo fixes the namespace mismatch

## Future Actions
1. Monitor Expo SDK updates for namespace fix
2. Test each new SDK version
3. Remove the Gradle workaround once the issue is resolved upstream

## Testing
```bash
# Local test
cd android
./gradlew assembleRelease

# EAS test
eas build -p android
```

## References
- Expo SDK: https://docs.expo.dev/versions/latest/
- Issue tracking: Check Expo GitHub issues for related reports
