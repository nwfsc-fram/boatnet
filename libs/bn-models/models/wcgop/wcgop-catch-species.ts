// WCGOP Species Item
// Combines:
// SPECIES_COMPOSITIONS
// SPECIES_COMPOSITION_ITEMS
// BIO_SPECIMENS

import { Species, Measurement, BoatnetDate, CouchID } from '../_common/index';
import { WcgopBasket } from './wcgop-basket';
import { WcgopDiscardReason } from './wcgop-discard-reason';
import { WcgopSpecimen } from './wcgop-specimen';
import { WcgopSightingEvent } from './wcgop-sighting-event';

declare type RockfishHandlingCode = string; // TODO

export interface WcgopCatchSpecies {
  species: Species;
  discardReason?: WcgopDiscardReason;
  speciesWeight?: Measurement;
  speciesCount?: number; // SPECIES_NUMBER
  totalTally?: number;

  specimens?: WcgopSpecimen[];

  basket?: WcgopBasket[];

  handling?: RockfishHandlingCode; // Rockfish Handling

  sightingEventIds?: CouchID[];

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
    obsprodLoadDate?: BoatnetDate;
  };
}
