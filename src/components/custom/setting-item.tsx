import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SettingItemProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
  onPress?: () => void;
};

export function SettingItem({ title, description, icon: Icon, right, onPress }: SettingItemProps) {
  const { colors } = useTheme();

  const content = (
    <View style={styles.row}>
      {Icon ? (
        <Icon
          size={20}
          color={colors.primary}
          accessibilityLabel={title}
        />
      ) : null}
      <View style={styles.textContainer}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return <ThemedView style={styles.staticItem}>{content}</ThemedView>;
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  staticItem: {
    minHeight: 44,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.half,
  },
  right: {
    justifyContent: 'center',
  },
});
