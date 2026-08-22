import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { BigDataCloudReverseResponse } from '@/@types/api.d';
import type { Coordinates, Place } from '@/@types/weather';
import { BIGDATACLOUD_REVERSE_URL } from '@/constants/config';
import { httpClient } from '@/services/api';
import { parseSubdivisionCode, toStateCode } from '@/utils/format-place';

function firstFilled(...values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    const trimmed = value?.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

/**
 * Preferred source: it returns ISO 3166-2 subdivision codes, so the "UF" is available for any
 * country instead of only the ones we can map by name.
 */
async function reverseGeocodeRemote(coords: Coordinates): Promise<Place | null> {
  const { data } = await httpClient.get<BigDataCloudReverseResponse>(BIGDATACLOUD_REVERSE_URL, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      localityLanguage: 'pt',
    },
  });

  const countryCode = data.countryCode?.toUpperCase() ?? null;
  const city = firstFilled(data.locality, data.city, data.principalSubdivision);

  if (!city) {
    return null;
  }

  return {
    city,
    state: firstFilled(data.principalSubdivision),
    stateCode:
      parseSubdivisionCode(data.principalSubdivisionCode) ??
      toStateCode(data.principalSubdivision, countryCode),
    countryName: firstFilled(data.countryName),
    countryCode,
  };
}

/** Offline fallback. Requires foreground location permission on Android. */
async function reverseGeocodeNative(coords: Coordinates): Promise<Place | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const [address] = await Location.reverseGeocodeAsync(coords);

  if (!address) {
    return null;
  }

  const countryCode = address.isoCountryCode?.toUpperCase() ?? null;
  const city = firstFilled(address.city, address.subregion, address.district, address.name);

  if (!city) {
    return null;
  }

  return {
    city,
    state: firstFilled(address.region),
    stateCode: toStateCode(address.region, countryCode),
    countryName: firstFilled(address.country),
    countryCode,
  };
}

export async function reverseGeocode(coords: Coordinates): Promise<Place | null> {
  try {
    const remotePlace = await reverseGeocodeRemote(coords);

    if (remotePlace) {
      return remotePlace;
    }
  } catch {
    // Falls through to the native geocoder below.
  }

  try {
    return await reverseGeocodeNative(coords);
  } catch {
    return null;
  }
}
