import { Base } from '../_base';
import { Species, Measurement } from '../_common/index';
import { WcgopBasket } from './wcgop-basket';
import { WcgopDiscardReason } from './wcgop-discard-reason';

// Combines SPECIES_COMPOSITIONS and
// SPECIES_COMPOSITION_ITEMS and
// SPECIES_COMPOSITION_BASKETS
export interface WcgopSpeciesItem {
  // TODO
  species: Species;
  discardReason?: WcgopDiscardReason;
  speciesWeight?: Measurement;
  speciesCount?: number; // SPECIES_NUMBER
  totalTally?: number;

  basket?: WcgopBasket[];

  legacy?: {
    speciesCompId?: number;
    speciesCompItemId?: number;
    catchId?: number;
    speciesWeightKp?: number;
    speciesWeightKpItq?: number;
    speciesNumberKp?: number;
    speciesNumberKpItq?: number;
    catchSampleMethod?: string;
    basketNumber?: number;
    handling?: string; // ? Ask neil what this is
  };
}
