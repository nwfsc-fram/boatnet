import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const CatchDispositionTypeName = 'catch-disposition';

export interface CatchDisposition extends BaseLookup {
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
