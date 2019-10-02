import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const ViabilityTypeName = 'viability';

export interface Viability extends Base {
  description?: string;
  lookupVal?: string;

  legacy?: {
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
