import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const InteractionTypeTypeName = 'interaction-type';

export interface InteractionType extends BaseLookup {

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
