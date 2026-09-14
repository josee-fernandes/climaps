import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loading } from '@/components/custom/loading';
import { WeatherCard } from '@/components/custom/weather-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useLocation } from '@/hooks/use-location';
import { useWeather } from '@/hooks/use-weather';

const LOCATION_ERROR_COPY = `Não foi possível acessar sua localização.

Verifique as permissões do aplicativo
ou escolha outra localização.`;

const WEATHER_ERROR_COPY = `Não foi possível carregar o clima.

Verifique sua conexão e tente novamente.`;

export default function HomeScreen() {
  const { coords, status, isLoading: isLocationLoading, requestPermission } = useLocation();
  const {
    data,
    isLoading: isWeatherLoading,
    isError,
    refetch,
    isFetching,
  } = useWeather(coords);

  useEffect(() => {
    if (status === 'idle') {
      void requestPermission();
    }
  }, [requestPermission, status]);

  const isLoading = isLocationLoading || isWeatherLoading || isFetching;

  if (isLoading && !data) {
    return <Loading message="Carregando clima..." />;
  }

  if (status === 'denied' || status === 'error') {
    return (
      <ErrorState
        message={LOCATION_ERROR_COPY}
        actionLabel="Tentar localização"
        onAction={() => {
          void requestPermission();
        }}
      />
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={WEATHER_ERROR_COPY}
        actionLabel="Tentar novamente"
        onAction={() => {
          void refetch().then((result) => {
            if (result.isSuccess) {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          });
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <WeatherCard snapshot={data} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ErrorState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.errorText}>
          {message}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={styles.actionButton}>
          <ThemedText type="linkPrimary">{actionLabel}</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  errorText: {
    lineHeight: 24,
  },
  actionButton: {
    marginTop: Spacing.three,
    minHeight: 44,
    justifyContent: 'center',
  },
});
