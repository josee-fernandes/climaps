import { FORECAST_DAYS, OPEN_METEO_FORECAST_URL } from '@/constants/config';
import { httpClient } from '@/services/api';
import { reverseGeocode } from '@/services/geocoding';
import type { OpenMeteoForecastResponse } from '@/@types/api.d';
import type {
  Coordinates,
  CurrentWeather,
  DailyForecastItem,
  SunCycle,
  WeatherSnapshot,
} from '@/@types/weather';
import { getWeatherLabel } from '@/utils/weather-icon';

function mapCurrentWeather(response: OpenMeteoForecastResponse): CurrentWeather {
  const { current } = response;
  const isDay = current.is_day === 1;

  return {
    temperatureC: current.temperature_2m,
    apparentTemperatureC: current.apparent_temperature,
    humidityPercent: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    condition: {
      weatherCode: current.weather_code,
      label: getWeatherLabel(current.weather_code),
      isDay,
    },
  };
}

function mapSunCycle(response: OpenMeteoForecastResponse): SunCycle {
  return {
    sunriseIso: response.daily.sunrise[0] ?? '',
    sunsetIso: response.daily.sunset[0] ?? '',
  };
}

function mapDailyForecast(response: OpenMeteoForecastResponse): DailyForecastItem[] {
  const { daily } = response;

  return daily.time.map((dateIso, index) => ({
    dateIso,
    weatherCode: daily.weather_code[index] ?? 0,
    temperatureMaxC: daily.temperature_2m_max[index] ?? 0,
    temperatureMinC: daily.temperature_2m_min[index] ?? 0,
  }));
}

export async function getForecast(coords: Coordinates): Promise<WeatherSnapshot> {
  const { data } = await httpClient.get<OpenMeteoForecastResponse>(OPEN_METEO_FORECAST_URL, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
      timezone: 'auto',
      wind_speed_unit: 'kmh',
      forecast_days: FORECAST_DAYS,
    },
  });

  return {
    timezone: data.timezone,
    place: null,
    current: mapCurrentWeather(data),
    sun: mapSunCycle(data),
    daily: mapDailyForecast(data),
  };
}

export async function getWeather(coords: Coordinates): Promise<WeatherSnapshot> {
  const [forecast, place] = await Promise.all([getForecast(coords), reverseGeocode(coords)]);

  return {
    ...forecast,
    place,
  };
}
