import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const MaturityTypeName = 'maturity';

export interface Maturity extends Base {
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
