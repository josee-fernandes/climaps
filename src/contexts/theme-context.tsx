import * as SystemUI from 'expo-system-ui';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { Colors, type ResolvedTheme } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getThemePreference, setThemePreference } from '@/storage/preferences';
import type { ThemePreference } from '@/schemas/settings.schema';

export type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => Promise<void>;
  colors: (typeof Colors)[ResolvedTheme];
  isReady: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(preference: ThemePreference, deviceScheme: 'light' | 'dark'): ResolvedTheme {
  if (preference === 'system') {
    return deviceScheme;
  }

  return preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useColorScheme();
  const deviceScheme: 'light' | 'dark' = deviceColorScheme === 'dark' ? 'dark' : 'light';

  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  const resolvedTheme = resolveTheme(theme, deviceScheme);
  const colors = Colors[resolvedTheme];

  useEffect(() => {
    let isMounted = true;

    async function hydrateTheme() {
      try {
        const stored = await getThemePreference();

        if (stored && isMounted) {
          setThemeState(stored);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void hydrateTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const setTheme = useCallback(async (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    await setThemePreference(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      colors,
      isReady,
    }),
    [theme, resolvedTheme, setTheme, colors, isReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
