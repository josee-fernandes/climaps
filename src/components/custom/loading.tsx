import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LoadingProps = {
  message?: string;
};

export function Loading({ message }: LoadingProps) {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator
        color={colors.primary}
        accessibilityLabel={message ?? 'Carregando'}
      />
      {message ? (
        <ThemedText type="small" themeColor="textSecondary">
          {message}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
