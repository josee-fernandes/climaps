import { TabSlot, type TabsDescriptor, type TabsSlotRenderOptions } from 'expo-router/ui';
import { type ReactNode, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { TAB_ORDER, type TabName } from '@/constants/navigation';
import { useFocusedTabIndex, useTabTransition } from '@/hooks/use-tab-transition';

/**
 * Renders every visited tab stacked on top of each other instead of hiding the inactive ones,
 * so the outgoing and the incoming screens can slide together.
 */
export function AnimatedTabSlot() {
  const focusedIndex = useFocusedTabIndex();

  const renderScreen = useCallback(
    (descriptor: TabsDescriptor, { isFocused, loaded }: TabsSlotRenderOptions) => {
      // Keeps tabs lazy: a screen only mounts once it has been visited.
      if (!loaded && !isFocused) {
        return null;
      }

      return (
        <SlidingTabScreen
          key={descriptor.route.key}
          index={TAB_ORDER.indexOf(descriptor.route.name as TabName)}
          focusedIndex={focusedIndex}
          isFocused={isFocused}>
          {descriptor.render()}
        </SlidingTabScreen>
      );
    },
    [focusedIndex],
  );

  return <TabSlot detachInactiveScreens={false} renderFn={renderScreen} />;
}

type SlidingTabScreenProps = {
  index: number;
  focusedIndex: number;
  isFocused: boolean;
  children: ReactNode;
};

function SlidingTabScreen({ index, focusedIndex, isFocused, children }: SlidingTabScreenProps) {
  const animatedStyle = useTabTransition(index, focusedIndex);

  return (
    <Animated.View
      pointerEvents={isFocused ? 'auto' : 'none'}
      accessibilityElementsHidden={!isFocused}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
      style={[StyleSheet.absoluteFill, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
