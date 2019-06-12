import { BoatnetUser, CouchID, Measurement } from '../_common';
import { Base } from '../_base';
import { HlfcProductDeliveryState } from '../_lookups/hlfc-product-delivery-state';
import { HlfcAerialExtent } from '../_lookups/hlfc-aerial-extent';
import { HlfcHorizontalExtent } from '../_lookups/hlfc-horizontal-extent';
import { HlfcMitigationType } from '../_lookups/hlfc-mitigation-type';

export const WcgopHlfcConfigurationTypeName = 'wcgop-hlfc-configuration';


export interface WcgopHlfcConfiguration extends Base {
  operations?: CouchID[];
  productDeliveryState?: HlfcProductDeliveryState;
  avgSpeed?: Measurement;
  floatsUsed?: boolean;
  floatsPerSegment?: number;
  sinkersUsed?: boolean;
  weightPerSinker?: Measurement; // oz or lbs
  avgNumSinkersPerSegment?: number;

  mitigationTypes?: HlfcMitigationType[]; // Pulled from Operations
  avgAerialExtent?: HlfcAerialExtent; // Streamer Line related
  avgHorizontalExtent?: HlfcHorizontalExtent; // Streamer Line related

  legacy?: {
    avgNumHooksPerSegment?: number; // pull up to WcgopOperation
  };
  // Noticable number of comments mention (widely) varying speeds,
  // we might want to capture this going forward
  // Noticable number of comments also mention specific methods
  // of mitigation listed as "other", such as "bird banger",
  // might want to add these to built in selections
}
