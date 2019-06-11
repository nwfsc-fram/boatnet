import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const CatchDispositionTypeName = 'catch-disposition';

export interface CatchDisposition extends Base {
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