import '@/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider as RouterThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppTabs from '@/components/app-tabs';
import { Splash } from '@/components/custom/splash';
import {
  QUERY_GC_TIME_MS,
  QUERY_RETRY,
  QUERY_STALE_TIME_MS,
} from '@/constants/config';
import { ThemeProvider } from '@/contexts/theme-context';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      retry: QUERY_RETRY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

function RootLayoutInner() {
  const { resolvedTheme, isReady, colors } = useTheme();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function hideSplash() {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Always attempt to hide splash even if it fails.
      }
    }

    void hideSplash();
  }, [isReady]);

  if (!isReady) {
    return <Splash />;
  }

  return (
    <RouterThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <AppTabs />
    </RouterThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootLayoutInner />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
