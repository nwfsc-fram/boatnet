import { Base } from '../_base/index';
import { BoatnetDate, CouchID } from '../_common';
import { TaxonomyAlias } from './taxonomy-alias';

export const TaxonomyTypeName = 'taxonomy';

declare type TaxonomyLevel = string; // TODO Lookup
export type TaxonomyId = CouchID;

// Each taxonomic record will be in a different document
export interface Taxonomy extends Base {
  taxonomyId: TaxonomyId; // Use this instead of _id for clarity except for top level record
  level: TaxonomyLevel;
  taxonomyName: string; // name at the given level, i.e. Sebastes, etc.
  scientificName?: string; // species and below concatenation/population (species + subspecies, etc.)
  children?: TaxonomyId[];
  parent?: TaxonomyId;

  // QUESTION - What about for analysis?
  //   Do we need a flattened view of all of this?  How would that work?
  //

  // WCGOP specific usage
  // wcgopTallyShortCode?: string; // moved to TaxonomyAlias
  // pacfinSpeciesCode?: string;  // This is used by EDC - moved to TaxonomyAlias

  // Obs Analysts - might be used by observer analysts, confirm
  // pacfinNomCode?: string; // when a landing does not have species comp

  // External species ID records / References
  // Priorities of us
  // fish - use AFS, everything else use ITIS

  afsId?: number; // Check if NWFSC has an AFS membership and if so, use this to get the IDs
  itisTSN?: number;
  wormsAphiaId?: number;

  isInactive: boolean;

  legacy?: {
    wcgopSpeciesId?: number; // primary key
    wcgopSpeciesCode?: number; // 3-4 digit code, adopted from AFSC
    wcgopCatchCategoryCode?: string; // ETL Note - only for single species catch category codes
    ashopSpeciesId?: number; // NORPAC ID
    obsAnalystCode?: string; // ToDo - Kayleigh spreadsheet
    edcCode?: number;
    dwId?: number;
    raceBaseCodeNW?: number; // AFSC RaceBase code + 1 digit
  };
}
