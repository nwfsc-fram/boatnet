import { BoatnetDate } from '../_common';
import { BaseLookup } from '../_base';

export const BeaufortTypeName = 'beaufort';

export interface Beaufort extends BaseLookup {
  // description

  legacy?: {
    lookupVal?: number;
    active?: boolean;
    programId?: number;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };

}
