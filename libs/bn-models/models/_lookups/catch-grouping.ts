import { Base } from '../_base/index';
import { BoatnetDate } from '../_common';
import { Taxonomy } from './taxonomy';
import { MarineDebris } from './marine-debris';

export const CatchGroupingTypeName = 'catch-grouping';
declare type MemberType = Taxonomy | MarineDebris;

export interface CatchGrouping extends Base {
  name: string;
  code?: number;
  members?: MemberType[]; // Could be an empty member list (e.g. sharks)
  isInactive?: boolean;

  legacy?: {
    // ETL Note - Only for multi-species catch categories
    wcgopCatchCategoryCode?: string;
  };
}
