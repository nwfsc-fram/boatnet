import { Base } from '../_base';
import { Species, Measurement } from '../_common/index';
import { AshopBasket } from './ashop-basket';
import { AshopDiscardReason } from './ashop-discard-reason';

// Combines SPECIES_COMPOSITIONS and
// SPECIES_COMPOSITION_ITEMS and
// SPECIES_COMPOSITION_BASKETS
export interface AshopSpeciesItem {
  // TODO
  species: Species;
  discardReason?: AshopDiscardReason;
  speciesWeight?: Measurement;
  speciesCount?: number; // SPECIES_NUMBER
  totalTally?: number;

  basket?: AshopBasket[];

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
