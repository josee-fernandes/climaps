import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClimapsMapView } from '@/components/custom/map-view';
import { Loading } from '@/components/custom/loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useLocation } from '@/hooks/use-location';
import { useMapSelection } from '@/hooks/use-map-selection';
import { useWeather } from '@/hooks/use-weather';
import { getPlaceLabel } from '@/utils/format-place';
import { formatTemperature } from '@/utils/format-temperature';

const LOCATION_ERROR_COPY = `Não foi possível acessar sua localização.

Verifique as permissões do aplicativo
ou escolha outra localização.`;

const WEATHER_ERROR_COPY = `Não foi possível carregar o clima.

Verifique sua conexão e tente novamente.`;

export default function MapScreen() {
  const { selectedCoords, selectLocation, clearSelection } = useMapSelection();
  const { coords, status, isLoading: isLocationLoading, requestPermission } = useLocation();
  const displayCoords = selectedCoords ?? coords;
  const {
    data,
    isLoading: isWeatherLoading,
    isError,
    refetch,
    isFetching,
  } = useWeather(displayCoords);

  useEffect(() => {
    if (status === 'idle') {
      void requestPermission();
    }
  }, [requestPermission, status]);

  const isInitialWeatherLoading =
    !selectedCoords && !data && (isWeatherLoading || isFetching) && !isError;

  if ((isLocationLoading || status === 'idle' || status === 'requesting') && !coords) {
    return <Loading message="Carregando mapa..." />;
  }

  if (status === 'denied' || status === 'error' || !coords) {
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

  if (isInitialWeatherLoading) {
    return <Loading message="Carregando mapa..." />;
  }

  if (!selectedCoords && (isError || !data)) {
    return (
      <ErrorState
        message={WEATHER_ERROR_COPY}
        actionLabel="Tentar novamente"
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  const place = data ? getPlaceLabel(data.place) : null;
  const userMarkerLabel = selectedCoords ? 'Localização atual' : (place?.title ?? 'Localização atual');
  const selectedMarkerLabel = selectedCoords
    ? (place?.title ?? 'Local selecionado')
    : 'Local selecionado';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.mapContainer}>
        <ClimapsMapView
          latitude={coords.latitude}
          longitude={coords.longitude}
          markerLabel={userMarkerLabel}
          selectedLatitude={selectedCoords?.latitude ?? null}
          selectedLongitude={selectedCoords?.longitude ?? null}
          selectedMarkerLabel={selectedMarkerLabel}
          onLocationSelect={selectLocation}
          onSelectionClear={clearSelection}
        />
      </View>
      <ThemedView
        style={styles.panel}
        accessibilityRole="summary"
        accessibilityLabel="Informações do clima no mapa">
        <SafeAreaView edges={['bottom']} style={styles.panelContent}>
          {selectedCoords && (isWeatherLoading || isFetching) && !data ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando clima...
            </ThemedText>
          ) : null}
          {selectedCoords && isError ? (
            <>
              <ThemedText type="small" themeColor="textSecondary" style={styles.errorText}>
                {WEATHER_ERROR_COPY}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar novamente"
                onPress={() => {
                  void refetch();
                }}
                style={styles.link}>
                <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
              </Pressable>
            </>
          ) : null}
          {data && place && !(selectedCoords && isError) ? (
            <>
              <ThemedText type="smallBold">{place.title}</ThemedText>
              {place.country ? (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  accessibilityLabel={place.countryAccessibilityLabel ?? undefined}>
                  {place.country}
                </ThemedText>
              ) : null}
              <ThemedText type="default">
                {formatTemperature(data.current.temperatureC)} · {data.current.condition.label}
              </ThemedText>
            </>
          ) : null}
        </SafeAreaView>
      </ThemedView>
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
      <SafeAreaView style={styles.errorSafeArea}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.errorText}>
          {message}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={styles.link}>
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
  mapContainer: {
    flex: 1,
  },
  panel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  panelContent: {
    gap: Spacing.one,
    paddingBottom: Spacing.three,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
  errorSafeArea: {
    flex: 1,
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  errorText: {
    lineHeight: 24,
  },
});
