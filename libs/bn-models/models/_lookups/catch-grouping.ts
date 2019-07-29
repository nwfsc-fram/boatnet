import { Base } from '../_base/index';
import { MarineDebris } from './marine-debris';
import { TaxonomyAlias } from './taxonomy-alias';
import { ManagementArea } from './management-area';

export const CatchGroupingTypeName = 'catch-grouping';
declare type GroupDefinition = string; // TODO Lookup - define these

/*
CatchGrouping Type
  - Species 
     -- Management Group - IFQ, FMP, etc
     -- Multi Species Group - blue/deacon, vermilion/sunset, etc.
  - Marine Debris
*/

export interface CatchGrouping extends Base {
  name: string;
  code?: number;
