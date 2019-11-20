import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const WaiverTypeTypeName = 'waiver-type';

export interface WaiverType extends BaseLookup {
    // description?: string; // Trip, Selection Cycle, Coverage Period
    // Selection Cycle = remainder of the year, remainder of 6-month cycle

    legacy?: {
      lookupVal?: number; // T, SC, CP
      programId?: number;
      active?: boolean;
      sortOrder?: number;
      lookupId?: number;
      obsprodLoadDate?: BoatnetDate;
      lookupType?: string;
  };
}
