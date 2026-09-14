import * as Haptics from 'expo-haptics';
import {
  TabList,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { CloudSun, MapIcon, Settings, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedTabSlot } from '@/components/custom/tab-slot';
import { ThemedText } from '@/components/themed-text';
import { TAB_HREFS, TAB_LABELS, TAB_ORDER, type TabName } from '@/constants/navigation';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TAB_ICONS: Record<TabName, LucideIcon> = {
  index: CloudSun,
  map: MapIcon,
  settings: Settings,
};

export default function AppTabs() {
  return (
    <Tabs>
      <AnimatedTabSlot />
      <TabList asChild>
        <TabBar>
          {TAB_ORDER.map((name) => (
            <TabTrigger key={name} name={name} href={TAB_HREFS[name]} asChild>
              <TabBarButton tab={name} />
            </TabTrigger>
          ))}
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({ children, style, ...props }: TabListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + Spacing.two,
        },
        style,
      ]}>
      <View style={styles.barContent}>{children}</View>
    </View>
  );
}

function TabBarButton({
  tab,
  isFocused,
  onPress,
  ...props
}: TabTriggerSlotProps & { tab: TabName }) {
  const { colors } = useTheme();
  const Icon = TAB_ICONS[tab];
  const label = TAB_LABELS[tab];

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onPress={(event) => {
        void Haptics.selectionAsync();
        onPress?.(event);
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon size={22} color={isFocused ? colors.primary : colors.textSecondary} />
      <ThemedText
        type="small"
        themeColor={isFocused ? 'primary' : 'textSecondary'}
        numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  barContent: {
    flexDirection: 'row',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
