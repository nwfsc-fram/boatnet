import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const DeterrenceTypeTypeName = 'deterrence-type';

export interface DeterrentType extends BaseLookup {
  // description| seal bomb, firearm, gaff, yelling, acoustic device, other

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
