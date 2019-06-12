import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const SpeciesCategoryTypeName = 'species-category';

export interface SpeciesCategory extends Base {
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
