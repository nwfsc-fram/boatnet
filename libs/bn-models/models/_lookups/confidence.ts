import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const ConfidenceTypeName = 'confidence';

export interface Confidence extends Base {
  description?: string;
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
