import { Base } from '../_base';
import { BoatnetDate } from '../_common';
import { CatchGrouping } from './catch-grouping';
import { TaxonomyAlias } from './taxonomy-alias';
import { FishingArea } from './fishing-area';

declare type ManagementType = string; // TODO - lookup - IFQ, FMP, etc.
export const ManagementAreaTypeName = 'management-area';

// Source - OBSPROD.IFQ_SPECIE_GROUPINGS
export interface ManagementArea extends Base {
  name: string; // possibly a concatenation of year + area for this
  year: BoatnetDate;
  area: FishingArea; // 2 lines only per management area
  managementType: ManagementType;

  // Consider making TaxonomyAlias an array
  // i.e. it could be 2018, area = 200, and have arrowtooth + petrale
  // How is a management area uniquely defined?
  //  -- year + area combination?
  //  -- year + area + members combination?

  // Need to see how the expansion code is using this
  // Idea is:  for this area for a given year, expand all of these members
  // may or may not want to allow an array of members below, but rather
  // just have a CatchGrouping | TaxonomyAlias
  members: Array<CatchGrouping | TaxonomyAlias>;
}

/*
    Arrowtooth
        area: 100
        year: 2019
    Arrowtooth
        area: 200
        year: 2019
    ...

    Minor Shelf Rockfish North
        area: 100
        members:  CatchGrouping = Minor Shelf Rockfish North

    Minor Shelf Rockfish South
        area: 200
        members:  CatchGrouping = Minor Shelf Rockfish South

    Minor Shelf Rockfish South
        area: 300
        members:  CatchGrouping = Minor Shelf Rockfish South

    Minor Shelf Rockfish South
        area: 400
        members:  CatchGrouping = Minor Shelf Rockfish South

*/
