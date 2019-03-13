// WCGOP Catch
import { BaseCatch } from '../_base/base-catch';
import { Measurement } from '../_common/index';

export const WcgopCatchTypeName = 'wcgop-catch';

export interface WcgopCatch extends BaseCatch {

  specimens?: any[]; // TODO Specimens interface
  baskets?: any[]; // TODO Baskets interface

  weightMethod: string;
  weight?: Measurement;
  count?: number;
  disposition?: string;
  discardReason?: string;
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
  //catch_category?: string; // legacy
  //catchPurity?: string; // legacy
}
