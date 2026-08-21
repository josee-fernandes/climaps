import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MAP_LATITUDE_DELTA, MAP_LONGITUDE_DELTA } from '@/constants/config';
import { useTheme } from '@/hooks/use-theme';

type ClimapsMapViewProps = {
  latitude: number;
  longitude: number;
  children?: React.ReactNode;
};

export function ClimapsMapView({ latitude, longitude, children }: ClimapsMapViewProps) {
  const { resolvedTheme } = useTheme();

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.webFallback}>
        <ThemedText type="default" themeColor="textSecondary">
          Mapa disponível no aplicativo móvel.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <MapView
      style={styles.map}
      userInterfaceStyle={resolvedTheme}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: MAP_LATITUDE_DELTA,
        longitudeDelta: MAP_LONGITUDE_DELTA,
      }}
      region={{
        latitude,
        longitude,
        latitudeDelta: MAP_LATITUDE_DELTA,
        longitudeDelta: MAP_LONGITUDE_DELTA,
      }}>
      <Marker
        coordinate={{ latitude, longitude }}
        accessibilityLabel="Localização consultada"
      />
      {children}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
