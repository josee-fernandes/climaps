import { useContext } from 'react';

import {
  MapSelectionContext,
  type MapSelectionContextValue,
} from '@/contexts/map-selection-context';

export function useMapSelection(): MapSelectionContextValue {
  const context = useContext(MapSelectionContext);

  if (!context) {
    throw new Error('useMapSelection must be used within MapSelectionProvider');
  }

  return context;
}
