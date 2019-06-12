import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const SpeciesSubCategoryTypeName = 'species-sub-category';

export interface SpeciesSubCategory extends Base {
  description?: string;

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
