// A-SHOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement } from '../_common/index';
import { AshopSpeciesItem } from './ashop-species-item';
import { AshopSpecimen } from './ashop-specimen';

export const AshopCatchTypeName = 'Ashop-catch';

export interface AshopCatch extends BaseCatch {
  catchNum?: number;

  percentRetained?: number;
  disposition?: string;
  weightMethod?: string;
  speciesItems?: AshopSpeciesItem[];

  specimens?: AshopSpecimen[];
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
