import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const DiscardReasonTypeName = 'discard-reason';

export interface DiscardReason extends BaseLookup {
  // description

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
