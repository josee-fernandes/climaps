import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { TAB_TRANSITION_DURATION_MS, getTabIndex } from '@/constants/navigation';

/** Fast start with a long settle, equivalent to GSAP's `expo.out`. */
const TAB_TRANSITION_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export function useFocusedTabIndex(): number {
  const index = getTabIndex(usePathname());

  return index < 0 ? 0 : index;
}

/**
 * Places a tab screen relative to the focused one, measured in screen widths:
 * `-1` parked on the left, `0` focused, `1` parked on the right.
 *
 * Both screens involved in a transition animate at the same time, since the focused index
 * changes for all of them at once.
 */
export function useTabTransition(index: number, focusedIndex: number) {
  const { width } = useWindowDimensions();
  const offset = useSharedValue(Math.sign(index - focusedIndex));

  useEffect(() => {
    const target = Math.sign(index - focusedIndex);

    if (offset.value === target) {
      return;
    }

    // Skipping a tab (clima -> configurações) moves the middle screen from one side to the other.
    // It is off-screen the whole way, so it jumps instead of sweeping across the viewport.
    const staysOffScreen = Math.abs(offset.value) >= 1 && Math.abs(target) >= 1;

    offset.value = staysOffScreen
      ? target
      : withTiming(target, {
          duration: TAB_TRANSITION_DURATION_MS,
          easing: TAB_TRANSITION_EASING,
        });
  }, [focusedIndex, index, offset]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * width }],
  }));
}
