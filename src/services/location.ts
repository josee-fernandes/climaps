import { Alert } from 'react-native';
import * as Location from 'expo-location';

import type { Coordinates, LocationErrorCode } from '@/@types/weather';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export class LocationServiceError extends Error {
  code: LocationErrorCode;

  constructor(code: LocationErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'LocationServiceError';
  }
}

export function isValidCoordinates(coords: Coordinates | null): coords is Coordinates {
  if (!coords) {
    return false;
  }

  const { latitude, longitude } = coords;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}


export type { Coordinates, LocationErrorCode } from '@/@types/weather';

export async function getForegroundPermissionStatus(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

  if (status === Location.PermissionStatus.GRANTED) {
    return 'granted';
  }

  if (status === Location.PermissionStatus.DENIED && !canAskAgain) {
    return 'denied';
  }

  if (status === Location.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

export async function requestForegroundPermission(): Promise<'granted' | 'denied'> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  return status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied';
}

export async function explainAndRequestPermission(): Promise<'granted' | 'denied'> {
  const currentStatus = await getForegroundPermissionStatus();

  if (currentStatus === 'granted') {
    return 'granted';
  }

  const { canAskAgain } = await Location.getForegroundPermissionsAsync();

  if (currentStatus === 'denied' && !canAskAgain) {
    return 'denied';
  }

  return new Promise((resolve) => {
    Alert.alert(
      'Localização',
      'Usamos sua localização apenas para descobrir onde você está e consultar o clima dessa região.',
      [
        {
          text: 'Agora não',
          style: 'cancel',
          onPress: () => resolve('denied'),
        },
        {
          text: 'Continuar',
          onPress: () => {
            void requestForegroundPermission().then(resolve);
          },
        },
      ],
    );
  });
}

function mapLocationError(error: unknown): LocationServiceError {
  if (error instanceof LocationServiceError) {
    return error;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code);

    if (code.includes('E_LOCATION_TIMEOUT')) {
      return new LocationServiceError('timeout');
    }

    if (code.includes('E_LOCATION_UNAVAILABLE')) {
      return new LocationServiceError('unavailable');
    }
  }

  return new LocationServiceError('unknown');
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    if (!isValidCoordinates(coords)) {
      throw new LocationServiceError('unavailable');
    }

    return coords;
  } catch (error) {
    throw mapLocationError(error);
  }
}
