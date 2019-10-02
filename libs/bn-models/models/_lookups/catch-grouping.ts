import { Base } from '../_base/index';
import { MarineDebris } from './marine-debris';
import { TaxonomyAlias } from './taxonomy-alias';

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
  code?: number | string;
  members?: TaxonomyAlias[] | MarineDebris[]; // Could be an empty member list (e.g. sharks)
  parentTaxonomy?: TaxonomyAlias;
  definition?: GroupDefinition;

  // managementArea: ManagementArea;
  wcrIfqSpeciesGroupId?: number;
  isInactive?: boolean;

  legacy?: {
    // ETL Note - Only for multi-species catch categories
    wcgopCatchCategoryCode?: string;
  };
}

/*
Taxonomy Tasks
1. Categorize the types of potential CatchGroupings (Beth)
3. ETL Taxonomy records (Nick)
4. Learn how to ETL in TypeScript + Visual Studio Code (Beth)

Questions
- TaxonomyAlias - multiple unidentified for both Marine Debris + Taxonomy


*/
