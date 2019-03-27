// A-SHOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement } from '../_common/index';
import { AshopSampleSpecies } from './ashop-sample-species';
import { AshopBasket } from './ashop-basket';

export const AshopSampleTypeName = 'ashop-sample';

export interface AshopSample extends BaseCatch {
  sampleNum?: number; // unique/sequential within Haul
  isSubsample?: boolean; // for flattening convenience
  isPresorted?: boolean;
  isTruncated?: boolean; // Indicate a sample that was stopped (e.g. high species diversity)
  species?: AshopSampleSpecies[];
  subsamples?: AshopSample[];

  // Calculated from flowScale* + items not flowscale weighed
  totalSampleWeight?: Measurement;

  flowScaleStart?: Measurement;
  flowScaleEnd?: Measurement;

  legacy?: {
    sampleSequence?: number;
    // Omit combined sample flag
    // Omit # of segments sampled
    // Omit Hooks
    // Omit sample design flag
  };
}
