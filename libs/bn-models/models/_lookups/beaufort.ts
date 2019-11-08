import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const BeaufortTypeName = 'beaufort';

export interface Beaufort extends Base {
  description?: string;
  
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
