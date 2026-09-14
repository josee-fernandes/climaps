import { LocateFixed } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { buildMapHtml, parseMapMessage, type MapTheme } from '@/components/custom/map-html';
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

type MapBridge = {
  applyTheme: (theme: MapTheme) => void;
  setLocation: (coords: { latitude: number; longitude: number }) => void;
  setSelection: (coords: { latitude: number; longitude: number; label?: string }) => void;
  clearSelection: () => void;
  recenterToUser: () => void;
};

type MapViewOptions = {
  latitude: number;
  longitude: number;
  markerLabel: string;
  selectedLatitude: number | null;
  selectedLongitude: number | null;
  selectedLabel: string;
  mapTheme: MapTheme;
};

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
  const frameRef = useRef<HTMLIFrameElement>(null);
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

  // The srcDoc document inherits the parent origin, so the bridge is reachable directly.
  const getBridge = useCallback((): MapBridge | null => {
    const frameWindow = frameRef.current?.contentWindow as
      | (Window & { climaps?: MapBridge })
      | null
      | undefined;

    return frameWindow?.climaps ?? null;
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof event.data !== 'string') {
        return;
      }

      const message = parseMapMessage(event.data);

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
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [onLocationSelect, onSelectionClear]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    getBridge()?.applyTheme(mapTheme);
  }, [getBridge, mapTheme, status]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    getBridge()?.setLocation({ latitude, longitude });
  }, [getBridge, latitude, longitude, status]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    if (hasSelection(selectedLatitude, selectedLongitude) && selectedLongitude != null) {
      getBridge()?.setSelection({
        latitude: selectedLatitude,
        longitude: selectedLongitude,
        label: selectedMarkerLabel,
      });
      return;
    }

    getBridge()?.clearSelection();
  }, [getBridge, selectedLatitude, selectedLongitude, selectedMarkerLabel, status]);

  const recenterToUser = useCallback(() => {
    getBridge()?.recenterToUser();
  }, [getBridge]);

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
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.errorText}>
          {MAP_ERROR_COPY}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar carregar o mapa novamente"
          onPress={retry}
          style={styles.retryButton}>
          <ThemedText type="linkPrimary">Tentar novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <iframe
        key={reloadKey}
        ref={frameRef}
        title="Mapa da localização atual"
        srcDoc={html}
        style={iframeStyle}
      />
      {status === 'ready' && !hasSelection(selectedLatitude, selectedLongitude) ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Centralizar o mapa na minha localização"
          onPress={recenterToUser}
          style={({ pressed }) => [
            styles.recenterButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.recenterButtonPressed,
          ]}>
          <LocateFixed size={22} color={colors.primary} />
        </Pressable>
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

const iframeStyle = {
  border: 'none',
  width: '100%',
  height: '100%',
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
