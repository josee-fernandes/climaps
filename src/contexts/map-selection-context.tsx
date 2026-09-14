import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import type { Coordinates } from '@/@types/weather';
import { isValidCoordinates } from '@/services/location';

export type MapSelectionContextValue = {
  selectedCoords: Coordinates | null;
  selectLocation: (coords: Coordinates) => void;
  clearSelection: () => void;
};

export const MapSelectionContext = createContext<MapSelectionContextValue | null>(null);

export function MapSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(null);

  const selectLocation = useCallback((coords: Coordinates) => {
    if (!isValidCoordinates(coords)) {
      return;
    }

    setSelectedCoords(coords);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCoords(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedCoords,
      selectLocation,
      clearSelection,
    }),
    [clearSelection, selectLocation, selectedCoords],
  );

  return <MapSelectionContext.Provider value={value}>{children}</MapSelectionContext.Provider>;
}
