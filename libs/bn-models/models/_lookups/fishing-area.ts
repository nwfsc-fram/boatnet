import { BaseLookup } from '../_base';
import { MultiLineString } from 'geojson';

export const FishingAreaTypeName = 'fishing-area';

// Source - OBSPROD.LOOKUPS.FISHING_AREA
export interface FishingArea extends BaseLookup {
  label: number; // 100, 200, 300, 400
  geography: MultiLineString; // Top + Bottom latitude lines
}
