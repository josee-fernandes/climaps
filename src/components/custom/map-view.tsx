import * as WebBrowser from 'expo-web-browser';
import { LocateFixed } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  buildMapHtml,
  mapCommand,
  parseMapMessage,
  type MapTheme,
} from '@/components/custom/map-html';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MAP_ERROR_COPY = `Não foi possível carregar o mapa.

Verifique sua conexão e tente novamente.`;

type ClimapsMapViewProps = {
  latitude: number;
  longitude: number;
  markerLabel?: string;
  selectedLatitude?: number | null;
  selectedLongitude?: number | null;
  selectedMarkerLabel?: string;
  onLocationSelect?: (coords: { latitude: number; longitude: number }) => void;
  onSelectionClear?: () => void;
};

type MapStatus = 'loading' | 'ready' | 'error';

type MapViewOptions = {
  latitude: number;
  longitude: number;
  markerLabel: string;
  selectedLatitude: number | null;
  selectedLongitude: number | null;
  selectedLabel: string;
  mapTheme: MapTheme;
};

/** Local schemes used by the inline document; anything else is a link the user tapped. */
const INTERNAL_URL_PATTERN = /^(about:|data:|file:|blob:)/;

function hasSelection(
  latitude?: number | null,
  longitude?: number | null,
): latitude is number {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function ClimapsMapView({
  latitude,
  longitude,
  markerLabel = 'Localização atual',
  selectedLatitude = null,
  selectedLongitude = null,
  selectedMarkerLabel = 'Local selecionado',
  onLocationSelect,
  onSelectionClear,
}: ClimapsMapViewProps) {
  const { resolvedTheme, colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const mapTheme = useMemo<MapTheme>(
    () => ({
      theme: resolvedTheme,
      markerColor: colors.primary,
      selectedMarkerColor: colors.error,
      backgroundColor: colors.background,
      surfaceColor: colors.surface,
      textColor: colors.textSecondary,
    }),
    [
      colors.background,
      colors.error,
      colors.primary,
      colors.surface,
      colors.textSecondary,
      resolvedTheme,
    ],
  );

  // The document is built once per reload so theme and location changes can be pushed into the
  // live page instead of remounting it, which would drop the user's pan and zoom.
  const initialOptions = useRef<MapViewOptions>({
    latitude,
    longitude,
    markerLabel,
    selectedLatitude,
    selectedLongitude,
    selectedLabel: selectedMarkerLabel,
    mapTheme,
  });
  const html = useMemo(
    () =>
      buildMapHtml({
        latitude: initialOptions.current.latitude,
        longitude: initialOptions.current.longitude,
        markerLabel: initialOptions.current.markerLabel,
        selectedLatitude: initialOptions.current.selectedLatitude,
        selectedLongitude: initialOptions.current.selectedLongitude,
        selectedLabel: initialOptions.current.selectedLabel,
        ...initialOptions.current.mapTheme,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reloadKey],
  );

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    webViewRef.current?.injectJavaScript(mapCommand('applyTheme', mapTheme));
  }, [mapTheme, status]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    webViewRef.current?.injectJavaScript(mapCommand('setLocation', { latitude, longitude }));
  }, [latitude, longitude, status]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    if (hasSelection(selectedLatitude, selectedLongitude) && selectedLongitude != null) {
      webViewRef.current?.injectJavaScript(
        mapCommand('setSelection', {
          latitude: selectedLatitude,
          longitude: selectedLongitude,
          label: selectedMarkerLabel,
        }),
      );
      return;
    }

    webViewRef.current?.injectJavaScript(mapCommand('clearSelection'));
  }, [selectedLatitude, selectedLongitude, selectedMarkerLabel, status]);

  const recenterToUser = useCallback(() => {
    webViewRef.current?.injectJavaScript(mapCommand('recenterToUser'));
  }, []);

  const retry = useCallback(() => {
    initialOptions.current = {
      latitude,
      longitude,
      markerLabel,
      selectedLatitude,
      selectedLongitude,
      selectedLabel: selectedMarkerLabel,
      mapTheme,
    };
    setStatus('loading');
    setReloadKey((current) => current + 1);
  }, [
    latitude,
    longitude,
    mapTheme,
    markerLabel,
    selectedLatitude,
    selectedLongitude,
    selectedMarkerLabel,
  ]);

  if (status === 'error') {
    return <MapErrorState onRetry={retry} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        key={reloadKey}
        ref={webViewRef}
        style={styles.webView}
        containerStyle={styles.webView}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Mapa da localização atual"
        onMessage={(event) => {
          const message = parseMapMessage(event.nativeEvent.data);

          if (message?.type === 'ready') {
            setStatus('ready');
          }

          if (message?.type === 'error') {
            setStatus('error');
          }

          if (message?.type === 'locationSelected') {
            onLocationSelect?.({
              latitude: message.latitude,
              longitude: message.longitude,
            });
          }

          if (message?.type === 'selectionCleared') {
            onSelectionClear?.();
          }
        }}
        onError={() => setStatus('error')}
        onHttpError={() => setStatus('error')}
        onShouldStartLoadWithRequest={(request) => {
          if (INTERNAL_URL_PATTERN.test(request.url)) {
            return true;
          }

          void WebBrowser.openBrowserAsync(request.url);

          return false;
        }}
      />
      {status === 'ready' && !hasSelection(selectedLatitude, selectedLongitude) ? (
        <RecenterButton onPress={recenterToUser} />
      ) : null}
      {status === 'loading' ? (
        <ThemedView style={styles.overlay} pointerEvents="none">
          <ThemedText type="small" themeColor="textSecondary">
            Carregando mapa...
          </ThemedText>
        </ThemedView>
      ) : null}
    </View>
  );
}

function RecenterButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Centralizar o mapa na minha localização"
      onPress={onPress}
      style={({ pressed }) => [
        styles.recenterButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.recenterButtonPressed,
      ]}>
      <LocateFixed size={22} color={colors.primary} />
    </Pressable>
  );
}

function MapErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ThemedView style={styles.errorContainer}>
      <ThemedText type="default" themeColor="textSecondary" style={styles.errorText}>
        {MAP_ERROR_COPY}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tentar carregar o mapa novamente"
        onPress={onRetry}
        style={styles.retryButton}>
        <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  errorText: {
    lineHeight: 24,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.three,
    minHeight: 44,
    justifyContent: 'center',
  },
  recenterButton: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterButtonPressed: {
    opacity: 0.7,
  },
});
