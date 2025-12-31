import { Platform } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

/**
 * Calculate the proper bottom padding for content that needs to avoid the tab bar
 */
export const getTabBarSafeBottomPadding = (insets: EdgeInsets): number => {
  const baseTabBarHeight = Platform.OS === "android" ? 64 : 49;
  return baseTabBarHeight + insets.bottom + 8; // Small buffer
};

/**
 * Get the total tab bar height including safe area
 */
export const getTabBarHeight = (insets: EdgeInsets): number => {
  const baseTabBarHeight = Platform.OS === "android" ? 64 : 49;
  return baseTabBarHeight + insets.bottom;
};

/**
 * Check if device has safe area (like iPhone X+)
 */
export const hasSafeArea = (insets: EdgeInsets): boolean => {
  return insets.bottom > 0 || insets.top > 20;
};