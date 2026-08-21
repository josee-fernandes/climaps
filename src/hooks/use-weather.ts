import { useQuery } from '@tanstack/react-query';
import * as Network from 'expo-network';

import { isValidCoordinates, type Coordinates } from '@/services/location';
import { getWeather } from '@/services/weather';

export function useWeather(coords: Coordinates | null) {
  const query = useQuery({
    queryKey: ['weather', coords?.latitude, coords?.longitude],
    enabled: isValidCoordinates(coords),
    queryFn: async () => {
      if (!isValidCoordinates(coords)) {
        throw new Error('invalid-coordinates');
      }

      const networkState = await Network.getNetworkStateAsync();

      if (networkState.isConnected === false || networkState.isInternetReachable === false) {
        throw new Error('offline');
      }

      return getWeather(coords);
    },
  });

  const isOffline = query.error instanceof Error && query.error.message === 'offline';

  return {
    ...query,
    isOffline,
  };
}
