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
  name: string;
  admin1: string | null;
  country: string | null;
};

export type WeatherSnapshot = {
  timezone: string;
  place: Place | null;
  current: CurrentWeather;
  sun: SunCycle;
  daily: DailyForecastItem[];
};
