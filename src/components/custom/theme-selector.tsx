import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemePreference } from '@/schemas/settings.schema';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export function ThemeSelector() {
  const { theme, setTheme, colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      {THEME_OPTIONS.map((option) => {
        const isSelected = theme === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`Tema ${option.label}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              void Haptics.selectionAsync();
              void setTheme(option.value);
            }}
            style={[
              styles.option,
              {
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.backgroundSelected : colors.surface,
              },
            ]}>
            <ThemedText type="default" themeColor={isSelected ? 'primary' : 'text'}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  option: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
  },
});
