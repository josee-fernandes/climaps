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

export type BigDataCloudReverseResponse = {
  /** Smallest populated place, for example "São Paulo". */
  locality?: string;
  /** Broader locality, which can be a metropolitan area. */
  city?: string;
  /** State or province name, for example "São Paulo". */
  principalSubdivision?: string;
  /** ISO 3166-2 code, for example "BR-SP". */
  principalSubdivisionCode?: string;
  countryName?: string;
  /** ISO 3166-1 alpha-2 code, for example "BR". */
  countryCode?: string;
};
