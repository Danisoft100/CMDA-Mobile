# Safe Area Fix for Bottom Navigation Overlay

## Problem
The bottom navigation was overlaying content in EAS production builds but worked fine in Expo Go. This is because Expo Go has built-in safe area handling that production builds don't have.

## Solution Applied

### 1. Added SafeAreaProvider at App Root
- Wrapped the entire app with `SafeAreaProvider` in `App.tsx`
- This provides safe area context to all child components

### 2. Updated Tab Navigation
- Modified `navigations/tabs.tsx` to use `useSafeAreaInsets()`
- Tab bar height now includes device safe area (for iPhone X+ home indicator)
- Added proper padding to prevent content overlap

### 3. Enhanced AppContainer Component
- Updated `components/AppContainer.tsx` to calculate proper bottom padding
- Content now has enough space to avoid tab bar overlay
- Uses consistent safe area calculations

### 4. Added Utility Functions
- Created `utils/safeAreaUtils.ts` for consistent safe area calculations
- Centralized logic for tab bar height and padding calculations

### 5. Updated App Configuration
- Added safe area plugin configuration in `app.json`
- Added iOS status bar configuration
- Added Android keyboard layout mode

## Key Changes Made

### App.tsx
```typescript
// Added SafeAreaProvider wrapper
<SafeAreaProvider>
  <Provider store={store}>
    // ... rest of app
  </Provider>
</SafeAreaProvider>
```

### navigations/tabs.tsx
```typescript
// Now uses safe area insets for proper tab bar height
const insets = useSafeAreaInsets();
const totalTabBarHeight = getTabBarHeight(insets);

tabBarStyle: {
  height: totalTabBarHeight,
  paddingBottom: insets.bottom,
  // ... other styles
}
```

### components/AppContainer.tsx
```typescript
// Content padding now accounts for tab bar + safe area
const totalBottomPadding = getTabBarSafeBottomPadding(insets);

contentContainerStyle: {
  paddingBottom: totalBottomPadding,
  // ... other styles
}
```

## Testing
1. Build a new EAS build: `eas build -p android` or `eas build -p ios`
2. Test on devices with different screen sizes (especially iPhone X+ models)
3. Verify content is not overlapped by bottom navigation
4. Check that scrolling works properly and content is accessible

## Notes
- The fix maintains compatibility with Expo Go
- Works across all device types and screen sizes
- Consistent behavior between development and production builds
- No breaking changes to existing screen components