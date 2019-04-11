import { Base } from '../_base/index';
import { BoatnetDate } from '../_common';

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
    speciesCategory?: string;
    speciesSubcategory?: string;
    prioritySpecies?: boolean; // Y or NULL
    bsSpecies?: boolean; // Y or NULL
    formRequired?: boolean; // Y or NULL
    obsprodLoadDate: BoatnetDate
  };
}
