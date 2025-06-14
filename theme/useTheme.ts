import { useMemo } from 'react';
import { palette } from './palette';
import { typography } from './typography';

// Example theme hook for React Native
export function useTheme() {
  // You can expand this to use context or dynamic theming
  return useMemo(
    () => ({
      colors: {
        ...palette,
        text: palette.black,
        textSecondary: palette.grey,
        background: palette.background,
        border: palette.greyLight,
        card: palette.white,
        error: palette.error,
        primary: palette.primary,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      fontSizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
      },
      typography,
    }),
    []
  );
}
