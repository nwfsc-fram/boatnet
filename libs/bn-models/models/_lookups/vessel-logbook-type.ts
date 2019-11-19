import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const VesselLogbookTypeName = 'vessel-logbook-type';

export interface VesselLogbookType extends BaseLookup {
  // description?: string;

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
