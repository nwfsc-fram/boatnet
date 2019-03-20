// WCGOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement } from '../_common/index';
import { WcgopSpeciesItem } from './wcgop-species-item';
import { WcgopSpecimen } from './wcgop-specimen';

export const WcgopCatchTypeName = 'wcgop-catch';

export interface WcgopCatch extends BaseCatch {
  catchNum?: number;

  disposition?: string;
  weightMethod?: string;
  speciesItems?: WcgopSpeciesItem[];

  specimens?: WcgopSpecimen[];
  weight?: Measurement;
  count?: number;
  volume?: Measurement;
  density?: Measurement;
  hooksSampled?: number;
  sampleWeight?: Measurement;

  sampleCount?: number;
  gearSegmentsSampled?: number;

  legacy?: {
    catchCategoryId?: number;
    catchCategoryName?: string;
    catchCategoryCode?: string;
    catchPurity?: string;

    basketsWeighedItq: number;
    totalBasketsItq: number;
    partialBasketWeightItq: number;
    unitsSampledItq: number;
    totalUnitsItq: number;
    // All other _ITQ fields NULL, can ignore (confirm with Neil)

    basketWeightKp: number;
    addlBasketWeightKp: number;
    basketWeightCountKp: number;
  };
}
