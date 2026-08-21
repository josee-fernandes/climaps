type OpenMeteoCurrent = {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  is_day: number;
};

type OpenMeteoDaily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
};

export type OpenMeteoForecastResponse = {
  timezone: string;
  current: OpenMeteoCurrent;
  daily: OpenMeteoDaily;
};

type OpenMeteoReverseResult = {
  name: string;
  admin1?: string;
  country?: string;
};

export type OpenMeteoReverseResponse = {
  results?: OpenMeteoReverseResult[];
};
