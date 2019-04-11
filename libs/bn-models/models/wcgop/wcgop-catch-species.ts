// WCGOP Species Item
// Combines:
// SPECIES_COMPOSITIONS
// SPECIES_COMPOSITION_ITEMS
// BIO_SPECIMENS

import { Measurement, BoatnetDate, CouchID } from '../_common/index';
import { WcgopBasket } from './wcgop-basket';
import { WcgopDiscardReason } from './wcgop-discard-reason';
import { WcgopSpecimen } from './wcgop-specimen';
import { Base } from '../_base/index';
import { Species } from '../_lookups/index';

declare type RockfishHandlingCode = string; // TODO


export const WcgopCatchSpeciesTypeName = 'wcgop-catch-species';

export interface WcgopCatchSpecies extends Base {
  species: Species;
  discardReason?: WcgopDiscardReason;
  speciesWeight?: Measurement;
  speciesCount?: number; // SPECIES_NUMBER
  totalTally?: number;

  specimens?: WcgopSpecimen[];

  basket?: WcgopBasket[];

  handling?: RockfishHandlingCode; // Rockfish Handling

  sightingEventIds?: CouchID[];

  speciesCompDataSource?: string;
  speciesCompItemDataSource?: string;

  legacy?: {
    speciesCompId?: number;
    speciesCompItemId?: number;
    biospecimenId?: number;
    catchId?: number;
    speciesWeightKp?: number;
    speciesWeightKpItq?: number;
    speciesNumberKp?: number;
    speciesNumberKpItq?: number;
    catchSampleMethod?: string;
    basketNumber?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
