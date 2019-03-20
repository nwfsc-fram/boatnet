// WCGOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement } from '../_common/index';
import { WcgopSpeciesItem } from './wcgop-species-item';

export const WcgopCatchTypeName = 'wcgop-catch';

export interface WcgopCatch extends BaseCatch {
  specimens?: any[]; // TODO Specimens interface
  baskets?: any[]; // TODO Baskets interface

  disposition?: string;
  weightMethod?: string;
  species?: WcgopSpeciesItem[];

  weight?: Measurement;
  count?: number;
  volume?: {
    value: number;
    units: string;
  };
  density?: {
    value: number;
    units: string;
  };
  hooksSampled?: number;
  sample?: {
    weight?: number;
    units?: string;
    count?: number;
    gearSegments?: number;
  };
}
