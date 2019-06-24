import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const WaiverTypeTypeName = 'waiver-type';

export interface WaiverType extends Base {
  description?: string; // Trip, Selection Cycle, Coverage Period
    // Selection Cycle = remainder of the year, remainder of 6-month cycle
  lookupVal?: number; // T, SC, CP

  legacy?: {
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
