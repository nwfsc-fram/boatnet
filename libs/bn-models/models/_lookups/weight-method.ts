import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const WeightMethodTypeName = 'weight-method';

export interface WeightMethod extends BaseLookup {
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
