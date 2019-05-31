import { BaseCatch } from '../_base/base-catch';
import { Measurement, Basket, Specimen } from '../_common/index';

declare type WeightMethod = string; // TODO Lookups - visual estimate, volume, load cell

export const HakeSurveyCatchTypeName = 'hake-survey-catch';

export interface HakeSurveyCatch extends BaseCatch {

  // catchType?: CatchType; // codend, pocket net, mix, submix
  // contents?: (HakeSurveyCatch | HakeSurveyCatchSpecies)[];
  // isSubsampled?: boolean; // rare, but could occur
  weightMethod?: WeightMethod; // ETL from Haul SubsampleCode
  estimatedWeight?: Measurement; // via the weightMethod

  children?: HakeSurveyCatch[];

  specimens?: Specimen[];
  
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
