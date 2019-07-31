import { MultiLineString } from "geojson";

export const FishingAreaTypeName = 'fishing-area';

// Source - OBSPROD.LOOKUPS.FISHING_AREA
export interface FishingArea {
  label: number;  // 100, 200, 300, 400
  description: string;
  geography: MultiLineString; // Top + Bottom latitude lines
}