import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const DeterrenceTypeTypeName = 'deterrence-type';

export interface DeterrentType extends Base {
  description?: string; // seal bomb, firearm, gaff, yelling, acoustic device, other
  lookupVal?: number;

  legacy?: {
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
