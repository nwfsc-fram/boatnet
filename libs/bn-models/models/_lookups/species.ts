import { Base } from '../_base/index';
import { BoatnetDate } from '../_common';
import { SpeciesCategory } from './species-category';
import { SpeciesSubCategory } from './species-sub-category';

export const SpeciesTypeName = 'species';

export interface Species extends Base {
  scientificName: string;
  commonName: string;
  pacfinCode?: string;
  isActive: boolean; // 0 if false, default to true, TODO confirm with Neil

  legacy?: {
    raceCode?: string;
    speciesCode?: string;
    speciesId?: number;
    speciesCategory?: SpeciesCategory;
    speciesSubcategory?: SpeciesSubCategory;
    prioritySpecies?: boolean; // Y or NULL
    bsSpecies?: boolean; // Y or NULL
    formRequired?: boolean; // Y or NULL
    obsprodLoadDate: BoatnetDate
  };
}
