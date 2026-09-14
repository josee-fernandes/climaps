import type { Href } from 'expo-router';

/** Visual order of the tabs. The slide direction of a transition is derived from it. */
export const TAB_ORDER = ['index', 'map', 'settings'] as const;

export type TabName = (typeof TAB_ORDER)[number];

export const TAB_HREFS = {
  index: '/',
  map: '/map',
  settings: '/settings',
} as const satisfies Record<TabName, Href>;

export const TAB_LABELS: Record<TabName, string> = {
  index: 'Clima',
  map: 'Mapa',
  settings: 'Configurações',
};

export const TAB_TRANSITION_DURATION_MS = 420;

export function getTabIndex(pathname: string): number {
  return TAB_ORDER.findIndex((name) => TAB_HREFS[name] === pathname);
}
