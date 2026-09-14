import { Platform } from 'react-native';

import type { ColorTokens } from '@/constants/colors';

export const THEME_STORAGE_KEY = '@climaps/theme-preference';
export const THEMES = ['system', 'light', 'dark'] as const;

export type ThemeColor = keyof ColorTokens;

export const ReadexPro = {
  regular: 'ReadexPro_400Regular',
  medium: 'ReadexPro_500Medium',
  semibold: 'ReadexPro_600SemiBold',
  bold: 'ReadexPro_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: ReadexPro.regular,
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: ReadexPro.regular,
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export function sansFontFamily(weight: keyof typeof ReadexPro = 'regular') {
  return ReadexPro[weight];
}

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
