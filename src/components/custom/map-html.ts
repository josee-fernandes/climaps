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
import { isValidCoordinates } from '@/services/location';

export type MapTheme = {
  theme: ResolvedTheme;
  markerColor: string;
  /** The picked location uses a contrasting color so it never reads as the user's position. */
  selectedMarkerColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
};

export type MapHtmlOptions = MapTheme & {
  latitude: number;
  longitude: number;
  markerLabel: string;
  selectedLatitude?: number | null;
  selectedLongitude?: number | null;
  selectedLabel?: string;
};

/** Messages the page sends back through `window.ReactNativeWebView.postMessage`. */
export type MapMessage =
  | { type: 'ready' }
  | { type: 'error'; reason: string }
  | { type: 'locationSelected'; latitude: number; longitude: number }
  | { type: 'selectionCleared' };

export type MapCommandMethod =
  | 'applyTheme'
  | 'setLocation'
  | 'setSelection'
  | 'clearSelection'
  | 'recenterToUser';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseMapMessage(raw: string): MapMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || typeof parsed.type !== 'string') {
      return null;
    }

    if (parsed.type === 'ready') {
      return { type: 'ready' };
    }

    if (parsed.type === 'error') {
      return {
        type: 'error',
        reason: typeof parsed.reason === 'string' ? parsed.reason : 'unknown',
      };
    }

    if (parsed.type === 'selectionCleared') {
      return { type: 'selectionCleared' };
    }

    if (parsed.type === 'locationSelected') {
      const coords = {
        latitude: Number(parsed.latitude),
        longitude: Number(parsed.longitude),
      };

      if (!isValidCoordinates(coords)) {
        return null;
      }

      return { type: 'locationSelected', ...coords };
    }

    return null;
  } catch {
    return null;
  }
}

/** Serializes a call into the page's global bridge, ready for `injectJavaScript`. */
export function mapCommand(method: MapCommandMethod, payload: unknown = {}): string {
  return `window.climaps && window.climaps.${method}(${JSON.stringify(payload)}); true;`;
}

export function buildMapHtml(options: MapHtmlOptions): string {
  const initialState = JSON.stringify({
    latitude: options.latitude,
    longitude: options.longitude,
    markerLabel: options.markerLabel,
    selectedLatitude: options.selectedLatitude ?? null,
    selectedLongitude: options.selectedLongitude ?? null,
    selectedLabel: options.selectedLabel ?? 'Local selecionado',
    zoom: MAP_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    attribution: MAP_ATTRIBUTION,
    tileUrls: { light: MAP_TILE_URL_LIGHT, dark: MAP_TILE_URL_DARK },
    theme: {
      theme: options.theme,
      markerColor: options.markerColor,
      selectedMarkerColor: options.selectedMarkerColor,
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
  .climaps-pin {
    width: 28px; height: 38px; cursor: pointer;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
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
  var selectedMarker = null;

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

  function buildPinIcon(color) {
    return L.divIcon({
      className: '',
      iconSize: [28, 38],
      iconAnchor: [14, 38],
      html:
        '<svg class="climaps-pin" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M14 1.5c-6.35 0-11.5 5.15-11.5 11.5 0 8.05 11.5 23.5 11.5 23.5s11.5-15.45 11.5-23.5c0-6.35-5.15-11.5-11.5-11.5z"' +
        ' fill="' + color + '" stroke="#fff" stroke-width="2.5" />' +
        '<circle cx="14" cy="13" r="4.5" fill="#fff" />' +
        '</svg>',
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

    if (selectedMarker) {
      selectedMarker.setIcon(buildPinIcon(next.selectedMarkerColor));
    }
  }

  function setLocation(coords) {
    state.latitude = coords.latitude;
    state.longitude = coords.longitude;

    var latLng = [coords.latitude, coords.longitude];

    if (marker) {
      marker.setLatLng(latLng);
    }

    if (!selectedMarker) {
      map.setView(latLng, Math.max(map.getZoom(), state.zoom), { animate: true });
    }
  }

  function bindSelectedMarkerEvents(nextMarker) {
    nextMarker.on('click', function (event) {
      L.DomEvent.stop(event);
      climapsPost({ type: 'selectionCleared' });
    });
  }

  function setSelection(payload) {
    var latitude = payload.latitude;
    var longitude = payload.longitude;
    var label = payload.label || 'Local selecionado';
    var latLng = [latitude, longitude];

    if (selectedMarker) {
      selectedMarker.setLatLng(latLng);
      selectedMarker.setIcon(buildPinIcon(state.theme.selectedMarkerColor));
      selectedMarker.options.title = label;
      selectedMarker.options.alt = label;
    } else {
      selectedMarker = L.marker(latLng, {
        icon: buildPinIcon(state.theme.selectedMarkerColor),
        keyboard: false,
        alt: label,
        title: label,
      }).addTo(map);
      bindSelectedMarkerEvents(selectedMarker);
    }

    map.setView(latLng, Math.max(map.getZoom(), state.zoom), { animate: true });
  }

  // Dropping the pin keeps the current viewport; recentering is an explicit user action.
  function clearSelection() {
    if (!selectedMarker) {
      return;
    }

    map.removeLayer(selectedMarker);
    selectedMarker = null;
  }

  function recenterToUser() {
    if (!marker) {
      return;
    }

    map.setView(marker.getLatLng(), Math.max(map.getZoom(), state.zoom), { animate: true });
  }

  window.climaps = {
    applyTheme: applyTheme,
    setLocation: setLocation,
    setSelection: setSelection,
    clearSelection: clearSelection,
    recenterToUser: recenterToUser,
  };

  applyTheme(state.theme);

  marker = L.marker([state.latitude, state.longitude], {
    icon: buildIcon(state.theme.markerColor),
    keyboard: false,
    alt: state.markerLabel,
    title: state.markerLabel,
  }).addTo(map);

  map.on('contextmenu', function (event) {
    L.DomEvent.preventDefault(event);
    climapsPost({
      type: 'locationSelected',
      latitude: event.latlng.lat,
      longitude: event.latlng.lng,
    });
  });

  if (state.selectedLatitude != null && state.selectedLongitude != null) {
    setSelection({
      latitude: state.selectedLatitude,
      longitude: state.selectedLongitude,
      label: state.selectedLabel,
    });
  }

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
