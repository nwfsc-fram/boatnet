// WCGOP Catch
// Import from CATCHES table

import { BaseCatch } from '../_base/base-catch';
import { Measurement, BoatnetDate, CouchID } from '../_common/index';
import { HakeSurveyCatchSpecies, HakeSurveyCatchSpecies } from './hake-survey-catch-species';
import { CatchContent } from '../_lookups';
import { HakeSurveyBasket } from './hake-survey-basket';

declare type WeightMethod = string; // TODO Lookups - visual estimate, volume, load cell
declare type CatchType = string; /// TODO Lookups - codend, pocket net, mix, submix

export const HakeSurveyCatchTypeName = 'hake-survey-catch';

export interface HakeSurveyCatch extends BaseCatch {
  catchNum?: number; // Unique per Operation sequential
  catchType?: CatchType; // codend, pocket net, mix, submix
  contents?: (HakeSurveyCatch | HakeSurveyCatchSpecies)[];
  // isSubsampled?: boolean; // rare, but could occur
  weightMethod?: WeightMethod; // ETL from Haul SubsampleCode
  estimatedWeight?: Measurement; // via the weightMethod

  // TODO - Think about this and confirm that we're satisfied
  //  with having a separate baskets array for the mixes/submixes
  baskets?: HakeSurveyBasket[]; // used only for mix or submix

  legacy?: {
  };
}

/*
Codend              HSC
  Canary Rockfish     HSCS
    Basket 1            HSB
    Basket 2            HSB
  Dover sole          HSCS
  Mix #1              HSC
    Basket #1           HSB
    Pacific hake        HSCS
      Basket #1           HSB
    Aurora rockfish     HSCS
    Submix #1           HSC
      Basket #1           HSB
      Petrale sole        HSCS
        Basket #1           HSB
*/
