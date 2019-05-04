import { Base } from '../_base/index';
import { BoatnetDate } from '../_common';
import { Taxonomy } from './taxonomy';
import { Debris } from './debris';

export const CatchGroupingTypeName = 'grouping';
declare type MemberType = Taxonomy | Debris;

export interface CatchGrouping extends Base {
  name: string;
  code?: number;
  members?: MemberType[]; 
  isInactive?: boolean;   

  legacy?: {
    // ETL Note - Only for multi-species catch categories
    wcgopCatchCategoryCode?: string; 
  };  
}