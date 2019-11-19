import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const TripStatusTypeName = 'trip-status';

export interface TripStatus extends BaseLookup {

  legacy?: {
    lookupVal?: number;
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
