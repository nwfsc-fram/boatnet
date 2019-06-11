// A-SHOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement, CouchID, Specimen } from '../_common/index';

export const AshopCatchTypeName = 'ashop-catch';

export interface AshopCatch extends BaseCatch {
  // Catch = Sample in A-SHOP terminology, use sample for the UI

  sampleNum?: number; // unique/sequential within Haul
  isSubsample?: boolean; // for flattening convenience
  isPresorted?: boolean;
  isTruncated?: boolean; // Indicate a sample that was stopped (e.g. high species diversity)

  isPredominantSpecies?: boolean;
  isNotFlowScaleWeighed?: boolean; // not weighed by flow scale
  percentRetained?: number;
  sightingEventIds?: CouchID[];

  // species?: AshopSampleSpecies[];
  // subsamples?: AshopSample[];

  // Calculated from flowScale* + items not flowscale weighed
  totalSampleWeight?: Measurement;

  flowScaleStart?: Measurement;
  flowScaleEnd?: Measurement;

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
