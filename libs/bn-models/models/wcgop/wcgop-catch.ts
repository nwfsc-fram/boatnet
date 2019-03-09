// WCGOP Catch
import { BaseCatch } from '../_base';

export const WCGOPCatchTypeName = 'wcgop-catch';

export interface WCGOPCatch extends BaseCatch {
  weightMethod: string;
  weight?: {
    value: number;
    units: string;
  };
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

  //catch_category?: string; // legacyData
  //catchPurity?: string; // legacyData
}
