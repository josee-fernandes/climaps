export const APP_NAME = 'Climaps';
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const BIGDATACLOUD_REVERSE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';
export const HTTP_TIMEOUT_MS = 10_000;
export const QUERY_STALE_TIME_MS = 10 * 60 * 1000;
export const QUERY_GC_TIME_MS = 30 * 60 * 1000;
export const QUERY_RETRY = 2;
export const FORECAST_DAYS = 7;
export const MAP_ZOOM = 13;
export const MAP_MIN_ZOOM = 3;
export const MAP_MAX_ZOOM = 19;
export const LEAFLET_VERSION = '1.9.4';
export const MAP_TILE_URL_LIGHT =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const MAP_TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
/** Leaflet is loaded from a CDN, so the page reports back if it never became available. */
export const MAP_LOAD_TIMEOUT_MS = 8_000;
export const OPEN_METEO_SITE_URL = 'https://open-meteo.com';
