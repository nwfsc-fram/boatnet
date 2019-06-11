// WCGOP Catch
// Import from CATCHES table

import { BaseCatch } from '../_base/base-catch';
import { Measurement, BoatnetDate, CouchID, Basket } from '../_common/index';
import { WcgopDiscardReason } from './wcgop-discard-reason';
import { WcgopSpecimen } from './wcgop-specimen';
import { CatchDisposition } from '../_lookups/catch-disposition';
import { WeightMethod, Species } from '../_lookups';

export const WcgopCatchTypeName = 'wcgop-catch';
declare type RockfishHandlingCode = string; // TODO

export interface WcgopCatch extends BaseCatch {
  catchNum?: number; // Unique per Operation sequential
  disposition?: CatchDisposition;
  weightMethod?: WeightMethod;
  weight?: Measurement; // Could be species or higher level
  count?: number; // Could be at species or higher level
  sampleWeight?: Measurement;
  sampleCount?: number;
  gearSegmentsSampled?: number;

  // Species-level data
  species: Species;
  discardReason?: WcgopDiscardReason;
  totalTally?: number;
  handling?: RockfishHandlingCode; // Rockfish Handling
  sightingEventIds?: CouchID[];
  specimens?: WcgopSpecimen[];

  children?: WcgopCatch[];

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


    // WcgopCatchSpecies - legacy items
    speciesCompDataSource?: string;
    speciesCompItemDataSource?: string;

    speciesCompId?: number;
    speciesCompItemId?: number;
    biospecimenId?: number;
    // catchId?: number;
    speciesWeightKp?: number;
    speciesWeightKpItq?: number;
    speciesNumberKp?: number;
    speciesNumberKpItq?: number;
    catchSampleMethod?: string;
    basketNumber?: number;
    // obsprodLoadDate?: BoatnetDate;
  };
}
