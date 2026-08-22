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
};

type MapStatus = 'loading' | 'ready' | 'error';

type MapBridge = {
  applyTheme: (theme: MapTheme) => void;
  setLocation: (coords: { latitude: number; longitude: number }) => void;
};

export function ClimapsMapView({
  latitude,
  longitude,
  markerLabel = 'Localização atual',
}: ClimapsMapViewProps) {
  const { resolvedTheme, colors } = useTheme();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const mapTheme = useMemo<MapTheme>(
    () => ({
      theme: resolvedTheme,
      markerColor: colors.primary,
      backgroundColor: colors.background,
      surfaceColor: colors.surface,
      textColor: colors.textSecondary,
    }),
    [colors.background, colors.primary, colors.surface, colors.textSecondary, resolvedTheme],
  );

  const initialOptions = useRef({ latitude, longitude, markerLabel, mapTheme });
  const html = useMemo(
    () =>
      buildMapHtml({
        latitude: initialOptions.current.latitude,
        longitude: initialOptions.current.longitude,
        markerLabel: initialOptions.current.markerLabel,
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
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

  const retry = useCallback(() => {
    initialOptions.current = { latitude, longitude, markerLabel, mapTheme };
    setStatus('loading');
    setReloadKey((current) => current + 1);
  }, [latitude, longitude, mapTheme, markerLabel]);

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
});
