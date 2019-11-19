import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const ProgramTypeName = 'program';

export interface Program extends BaseLookup {
  name?: string;
  // description?: string;

  legacy?: {
    lookupId?: number;
    lookupVal?: number;
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
