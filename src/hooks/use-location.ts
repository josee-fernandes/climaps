import { useCallback, useEffect, useState } from 'react';

import type { Coordinates, LocationErrorCode } from '@/@types/weather';
import {
  explainAndRequestPermission,
  getCurrentCoordinates,
  getForegroundPermissionStatus,
  LocationServiceError,
} from '@/services/location';

export type LocationState = {
  coords: Coordinates | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  error: LocationErrorCode | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useLocation(): LocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationState['status']>('idle');
  const [error, setError] = useState<LocationErrorCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoordinates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextCoords = await getCurrentCoordinates();
      setCoords(nextCoords);
      setStatus('granted');
    } catch (caughtError) {
      setCoords(null);

      if (caughtError instanceof LocationServiceError) {
        setError(caughtError.code);
      } else {
        setError('unknown');
      }

      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setStatus('requesting');
    setIsLoading(true);
    setError(null);

    try {
      const permission = await explainAndRequestPermission();

      if (permission === 'denied') {
        setStatus('denied');
        setError('permission-denied');
        setCoords(null);
        return;
      }

      await fetchCoordinates();
    } finally {
      setIsLoading(false);
    }
  }, [fetchCoordinates]);

  const refresh = useCallback(async () => {
    const permission = await getForegroundPermissionStatus();

    if (permission !== 'granted') {
      setStatus(permission === 'denied' ? 'denied' : 'idle');
      setError(permission === 'denied' ? 'permission-denied' : null);
      setCoords(null);
      return;
    }

    await fetchCoordinates();
  }, [fetchCoordinates]);

  useEffect(() => {
    let isMounted = true;

    async function initializeLocation() {
      const permission = await getForegroundPermissionStatus();

      if (!isMounted) {
        return;
      }

      if (permission === 'granted') {
        await fetchCoordinates();
        return;
      }

      if (permission === 'denied') {
        setStatus('denied');
        setError('permission-denied');
        return;
      }

      setStatus('idle');
    }

    void initializeLocation();

    return () => {
      isMounted = false;
    };
  }, [fetchCoordinates]);

  return {
    coords,
    status,
    error,
    isLoading,
    requestPermission,
    refresh,
  };
}
