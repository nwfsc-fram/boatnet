import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const HlfcMitigationTypeTypeName = 'hlfc-mitigation-type';

export interface HlfcMitigationType extends BaseLookup {

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
