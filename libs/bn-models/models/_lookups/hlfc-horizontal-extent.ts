import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const HlfcHorizontalExtentTypeName = 'hlfc-horizontal-extent';

export interface HlfcHorizontalExtent extends BaseLookup {

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
