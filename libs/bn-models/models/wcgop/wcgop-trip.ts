// Unique fields of WCGOP trips
import { BaseTrip } from '../_base/baseTrip';
import { WCGOPHaul } from './wcgop-haul';

export const WCGOPTripTypeName = 'wcgop-trip';

export interface WCGOPTrip extends BaseTrip {
  logbookNum?: number;
  logbookType?: string;
  observerLogbook?: number;
}
