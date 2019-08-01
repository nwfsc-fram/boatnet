import { Base } from '../_base';
import { BoatnetDate } from '../_common';
import { string } from 'postcss-selector-parser';
import { Taxonomy } from './taxonomy';

export const SpeciesCategoryTypeName = 'species-category';

// Source - OBSPROD.SPECIES_SUB_CATEGORY
declare type SpeciesSubCategory = {
  name: string;
  taxonomy: Taxonomy;
}

// Source - OBSPROD.SPECIES_CATEGORY
export interface SpeciesCategory extends Base {
  description?: string;
  taxonomy?: Taxonomy;  // Beth to track down
  subCategories?: SpeciesSubCategory[]; // Beth to track down

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
