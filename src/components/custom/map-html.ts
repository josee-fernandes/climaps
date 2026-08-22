import type { ResolvedTheme } from '@/constants/colors';
import {
  LEAFLET_VERSION,
  MAP_ATTRIBUTION,
  MAP_LOAD_TIMEOUT_MS,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_TILE_URL_DARK,
  MAP_TILE_URL_LIGHT,
  MAP_ZOOM,
} from '@/constants/config';

export type MapTheme = {
  theme: ResolvedTheme;
  markerColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
};

export type MapHtmlOptions = MapTheme & {
  latitude: number;
  longitude: number;
  markerLabel: string;
};

/** Messages the page sends back through `window.ReactNativeWebView.postMessage`. */
export type MapMessage = { type: 'ready' } | { type: 'error'; reason: string };

export function parseMapMessage(raw: string): MapMessage | null {
  try {
    const parsed = JSON.parse(raw) as MapMessage;

    return parsed.type === 'ready' || parsed.type === 'error' ? parsed : null;
  } catch {
    return null;
  }
}

/** Serializes a call into the page's global bridge, ready for `injectJavaScript`. */
export function mapCommand(method: 'applyTheme' | 'setLocation', payload: unknown): string {
  return `window.climaps && window.climaps.${method}(${JSON.stringify(payload)}); true;`;
}

export function buildMapHtml(options: MapHtmlOptions): string {
  const initialState = JSON.stringify({
    latitude: options.latitude,
    longitude: options.longitude,
    markerLabel: options.markerLabel,
    zoom: MAP_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    attribution: MAP_ATTRIBUTION,
    tileUrls: { light: MAP_TILE_URL_LIGHT, dark: MAP_TILE_URL_DARK },
    theme: {
      theme: options.theme,
      markerColor: options.markerColor,
      backgroundColor: options.backgroundColor,
      surfaceColor: options.surfaceColor,
      textColor: options.textColor,
    },
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css" />
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
  body { background: ${options.backgroundColor}; overflow: hidden; }
  #map { background: ${options.backgroundColor}; }
  .leaflet-container { background: ${options.backgroundColor}; font-family: -apple-system, Roboto, sans-serif; }
  .climaps-marker { position: relative; }
  .climaps-marker__pulse {
    position: absolute; inset: -10px; border-radius: 50%;
    background: currentColor; opacity: 0.22; animation: climaps-pulse 2.4s ease-out infinite;
  }
  .climaps-marker__dot {
    position: absolute; inset: 0; border-radius: 50%;
    background: currentColor; border: 3px solid #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }
  @keyframes climaps-pulse {
    0% { transform: scale(0.6); opacity: 0.35; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .leaflet-control-attribution {
    font-size: 10px; border-radius: 6px 0 0 0;
  }
  .leaflet-bar a, .leaflet-control-attribution { border: none; }
  @media (prefers-reduced-motion: reduce) {
    .climaps-marker__pulse { animation: none; }
  }
</style>
</head>
<body>
<div id="map" role="application" aria-label="Mapa da localização atual"></div>
<script>
  var CLIMAPS_READY = false;
  function climapsPost(message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    } else if (window.parent !== window) {
      window.parent.postMessage(JSON.stringify(message), '*');
    }
  }
  setTimeout(function () {
    if (!CLIMAPS_READY) {
      climapsPost({ type: 'error', reason: 'timeout' });
    }
  }, ${MAP_LOAD_TIMEOUT_MS});
</script>
<script src="https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js"></script>
<script>
(function () {
  var state = ${initialState};

  if (typeof L === 'undefined') {
    climapsPost({ type: 'error', reason: 'leaflet-unavailable' });
    return;
  }

  var map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    minZoom: state.minZoom,
    maxZoom: state.maxZoom,
    zoomSnap: 0.5,
  }).setView([state.latitude, state.longitude], state.zoom);

  map.zoomControl.setPosition('topright');

  var tileLayer = null;
  var marker = null;

  function buildIcon(color) {
    return L.divIcon({
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      html:
        '<div class="climaps-marker" style="color: ' + color + '; width: 22px; height: 22px;">' +
        '<span class="climaps-marker__pulse"></span>' +
        '<span class="climaps-marker__dot"></span>' +
        '</div>',
    });
  }

  function applyTheme(next) {
    state.theme = next;

    if (tileLayer) {
      map.removeLayer(tileLayer);
    }

    tileLayer = L.tileLayer(state.tileUrls[next.theme] || state.tileUrls.light, {
      subdomains: 'abcd',
      maxZoom: state.maxZoom,
      attribution: state.attribution,
      detectRetina: false,
    }).addTo(map);

    document.body.style.background = next.backgroundColor;
    document.getElementById('map').style.background = next.backgroundColor;

    var attribution = document.querySelector('.leaflet-control-attribution');
    if (attribution) {
      attribution.style.background = next.surfaceColor;
      attribution.style.color = next.textColor;
    }

    if (marker) {
      marker.setIcon(buildIcon(next.markerColor));
    }
  }

  function setLocation(coords) {
    state.latitude = coords.latitude;
    state.longitude = coords.longitude;

    var latLng = [coords.latitude, coords.longitude];

    if (marker) {
      marker.setLatLng(latLng);
    }

    map.setView(latLng, Math.max(map.getZoom(), state.zoom), { animate: true });
  }

  window.climaps = { applyTheme: applyTheme, setLocation: setLocation };

  applyTheme(state.theme);

  marker = L.marker([state.latitude, state.longitude], {
    icon: buildIcon(state.theme.markerColor),
    keyboard: false,
    alt: state.markerLabel,
    title: state.markerLabel,
  }).addTo(map);

  tileLayer.on('load', function () {
    if (!CLIMAPS_READY) {
      CLIMAPS_READY = true;
      climapsPost({ type: 'ready' });
    }
  });

  map.whenReady(function () {
    map.invalidateSize();
  });
})();
</script>
</body>
</html>`;
}
