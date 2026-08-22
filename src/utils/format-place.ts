import type { Place } from '@/@types/weather';

export const PLACE_FALLBACK_LABEL = 'Sua região';

const BRAZIL_STATE_CODES: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/** Extracts the subdivision part of an ISO 3166-2 code, so "BR-SP" becomes "SP". */
export function parseSubdivisionCode(isoCode: string | null | undefined): string | null {
  if (!isoCode) {
    return null;
  }

  const [, subdivision] = isoCode.split('-');

  return subdivision ? subdivision.toUpperCase() : null;
}

/**
 * Platforms disagree on what a "region" is: iOS returns the short code ("SP") while Android
 * returns the full name ("São Paulo"). This normalizes both into a short code when possible.
 */
export function toStateCode(
  state: string | null | undefined,
  countryCode: string | null | undefined,
): string | null {
  if (!state) {
    return null;
  }

  const trimmed = state.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length <= 3 && trimmed === trimmed.toUpperCase()) {
    return trimmed;
  }

  if (countryCode?.toUpperCase() === 'BR') {
    return BRAZIL_STATE_CODES[normalizeName(trimmed)] ?? null;
  }

  return null;
}

/** Turns an ISO 3166-1 alpha-2 code into its regional indicator flag emoji. */
export function countryCodeToFlag(countryCode: string | null | undefined): string | null {
  if (!countryCode || !/^[A-Za-z]{2}$/.test(countryCode)) {
    return null;
  }

  const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 'A'.charCodeAt(0);

  return countryCode
    .toUpperCase()
    .split('')
    .map((letter) => String.fromCodePoint(letter.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET))
    .join('');
}

export type PlaceLabel = {
  /** "São Paulo, SP", or the fallback copy when there is no place. */
  title: string;
  /** "🇧🇷 Brasil", or null when the country is unknown. */
  country: string | null;
  /** Flag-free version of the country line, for screen readers. */
  countryAccessibilityLabel: string | null;
};

export function getPlaceLabel(place: Place | null | undefined): PlaceLabel {
  if (!place) {
    return { title: PLACE_FALLBACK_LABEL, country: null, countryAccessibilityLabel: null };
  }

  const region = place.stateCode ?? place.state;
  const title = region ? `${place.city}, ${region}` : place.city;
  const flag = countryCodeToFlag(place.countryCode);
  const countryName = place.countryName ?? null;

  if (!countryName) {
    return { title, country: flag, countryAccessibilityLabel: null };
  }

  return {
    title,
    country: flag ? `${flag} ${countryName}` : countryName,
    countryAccessibilityLabel: countryName,
  };
}
