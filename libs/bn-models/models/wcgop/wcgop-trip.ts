// Unique fields of WCGOP trips
import { BaseTrip } from '../_base/base-trip';
import { Program, Fishery, FirstReceiver, TripStatus } from '../_common/index';

export const WcgopTripTypeName = 'wcgop-trip';

export interface WcgopTrip extends BaseTrip {
  program?: Program;
  partialTrip?: boolean;
  fishingDays?: number;
  fishery?: Fishery;
  crewSize?: number;
  firstReceiver?: FirstReceiver;
  fishProcessed?: boolean;
  tripStatus?: TripStatus;
  logbookNum?: number;
  logbookType?: string;
  observerLogbook?: number;
}
