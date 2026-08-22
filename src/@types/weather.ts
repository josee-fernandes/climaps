export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationErrorCode = 'permission-denied' | 'unavailable' | 'timeout' | 'unknown';

export type WeatherCondition = {
  weatherCode: number;
  label: string;
  isDay: boolean;
};

export type CurrentWeather = {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  condition: WeatherCondition;
};

export type SunCycle = {
  sunriseIso: string;
  sunsetIso: string;
};

export type DailyForecastItem = {
  dateIso: string;
  weatherCode: number;
  temperatureMaxC: number;
  temperatureMinC: number;
};

export type Place = {
  city: string;
  /** Full state or province name, for example "São Paulo". */
  state: string | null;
  /** Short subdivision code, for example "SP". */
  stateCode: string | null;
  countryName: string | null;
  /** ISO 3166-1 alpha-2 code, for example "BR". */
  countryCode: string | null;
};

export type WeatherSnapshot = {
  timezone: string;
  place: Place | null;
  current: CurrentWeather;
  sun: SunCycle;
  daily: DailyForecastItem[];
};
