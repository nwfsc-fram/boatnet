import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const BehaviorTypeName = 'behavior';

export interface Behavior extends Base {
  description?: string;

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
