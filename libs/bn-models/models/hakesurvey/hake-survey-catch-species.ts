// WCGOP Species Item
// Combines:
// SPECIES_COMPOSITIONS
// SPECIES_COMPOSITION_ITEMS
// BIO_SPECIMENS

import { Measurement, BoatnetDate, CouchID } from '../_common/index';
import { HakeSurveyBasket } from './hake-survey-basket';
import { HakeSurveySpecimen } from './hake-survey-specimen';
import { Base } from '../_base/index';
import { Species, CatchContent } from '../_lookups/index';

declare type RockfishHandlingCode = string; // TODO


export const HakeSurveyCatchSpeciesTypeName = 'hake-survey-catch-species';

export interface HakeSurveyCatchSpecies extends Base {
  species: CatchContent;
  baskets?: HakeSurveyBasket[];
  specimens?: HakeSurveySpecimen[];

  legacy?: {
  };
}
