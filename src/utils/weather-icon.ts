import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';

const WEATHER_LABELS: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Principalmente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina',
  51: 'Chuvisco',
  53: 'Chuvisco',
  55: 'Chuvisco',
  56: 'Chuvisco',
  57: 'Chuvisco',
  61: 'Chuva',
  63: 'Chuva',
  65: 'Chuva',
  66: 'Chuva',
  67: 'Chuva',
  71: 'Neve',
  73: 'Neve',
  75: 'Neve',
  77: 'Neve',
  80: 'Chuva',
  81: 'Chuva',
  82: 'Chuva',
  85: 'Neve',
  86: 'Neve',
  95: 'Tempestade',
  96: 'Tempestade',
  99: 'Tempestade',
};

export function getWeatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? 'Nublado';
}

export function getWeatherIcon(code: number, isDay: boolean): LucideIcon {
  if (code === 0) {
    return isDay ? Sun : Moon;
  }

  if (code === 1) {
    return isDay ? Sun : Moon;
  }

  if (code === 2) {
    return isDay ? CloudSun : CloudMoon;
  }

  if (code === 3) {
    return Cloud;
  }

  if (code === 45 || code === 48) {
    return CloudFog;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return CloudDrizzle;
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return CloudRain;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return CloudSnow;
  }

  if ([95, 96, 99].includes(code)) {
    return CloudLightning;
  }

  return Cloud;
}
