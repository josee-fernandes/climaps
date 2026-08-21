import AsyncStorage from '@react-native-async-storage/async-storage';

import { THEME_STORAGE_KEY } from '@/constants/theme';
import { themePreferenceSchema, type ThemePreference } from '@/schemas/settings.schema';

export async function getThemePreference(): Promise<ThemePreference | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);

    if (!value) {
      return null;
    }

    const parsed = themePreferenceSchema.safeParse(value);

    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export async function setThemePreference(theme: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
}
