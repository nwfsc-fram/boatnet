import { Base } from '../_base';
import { CouchID } from '../_common/index';
import { AshopBasket, AshopSpecimen } from './index';
import { Species } from '../_lookups/index';

export interface AshopSampleSpecies extends Base {
  species: Species;
  isPredominantSpecies?: boolean;
  isNotFlowScaleWeighed?: boolean; // not weighed by flow scale
  percentRetained?: number;
  baskets?: AshopBasket[];
  specimens?: AshopSpecimen[];

  sightingEventIds?: CouchID[];
}
