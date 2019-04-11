// WCGOP Catch
// Import from CATCHES table

import { BaseCatch } from '../_base/base-catch';
import { Measurement, BoatnetDate, CouchID } from '../_common/index';
import { WcgopCatchSpecies } from './wcgop-catch-species';

export const WcgopCatchTypeName = 'wcgop-catch';

export interface WcgopCatch extends BaseCatch {
  catchNum?: number; // Unique per Operation sequential
  disposition?: string;
  weightMethod?: string;
  species?: WcgopCatchSpecies[];
  weight?: Measurement;
  count?: number;
  sampleWeight?: Measurement;
  sampleCount?: number;
  gearSegmentsSampled?: number;

  legacy?: {
    catchId?: number;
    catchCategoryId?: number;
    catchCategoryName?: string;
    catchCategoryCode?: string;
    catchPurity?: string;

    volume?: Measurement;
    density?: Measurement;

    basketsWeighedItq?: number;
    totalBasketsItq?: number;
    partialBasketWeightItq?: number;
    unitsSampledItq?: number;
    totalUnitsItq?: number;
    // All other _ITQ fields NULL, can ignore (confirm with Neil)

    basketWeightKp?: number;
    addlBasketWeightKp?: number;
    basketWeightCountKp?: number;

    obsprodLoadDate?: BoatnetDate;
    hooksSampled?: number; // pulled up to Operation
  };
}
