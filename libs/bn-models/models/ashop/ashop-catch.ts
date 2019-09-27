// A-SHOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement, CouchID, Specimen } from '../_common/index';

export const AshopCatchTypeName = 'ashop-catch';

export interface AshopCatch extends BaseCatch {
  // Catch = Sample in A-SHOP terminology, use sample for the UI

  /* Column items to show on the Ashop Catch screen from baseCatch
     catchNum
     catchContent - e.g. Pacific hake, Canary rockfish
     baskets - give a count of how many have been taken
     protocol
  */

  sampleNum?: number; // unique/sequential within Haul
                      // column  (subsable number - if
                      // sameple is subsample - 101, 102,
                      // 103 etc in sample 1)
  isSubsample?: boolean; // for flattening convenience
  isPresorted?: boolean;
  isTruncated?: boolean; // Indicate a sample that was stopped (e.g. high species diversity)

  isPredominantSpecies?: boolean;  // column (drives which scale to use)
  isNotFlowScaleWeighed?: boolean; // not weighed by flow scale  // column
  percentRetained?: number;  // column
  sightingEventIds?: CouchID[];

  // species?: AshopSampleSpecies[];
  // subsamples?: AshopSample[];

  // Calculated from flowScale* + items not flowscale weighed
  totalSampleWeight?: Measurement;  // column

  flowScaleStart?: Measurement;  // column
  flowScaleEnd?: Measurement; // column

  children?: AshopCatch[];

  specimens?: Specimen[];

  legacy?: {
    sampleSequence?: number;
    parentSequence?: number;
    cruiseNum?: number;
    permit?: string;
    // Omit combined sample flag
    // Omit # of segments sampled
    // Omit Hooks
    // Omit sample design flag
  };
}
