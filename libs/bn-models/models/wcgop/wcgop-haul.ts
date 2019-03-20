// WCGOP Haul
import { BaseOperation } from '../_base/base-operation';
import { LocationEvent } from '../_common/index';
import { WcgopBrd, WcgopHlfc } from './index';
import { WcgopSightingEvent } from './wcgop-sighting-event';

export const WcgopHaulTypeName = 'wcgop-haul';

// TODO: Create both WCGOP Trawl and Fixed Gear haul types?
export interface WcgopHaul extends BaseOperation {
  // catches?: WcgopCatch[];  // TODO
  haulNum: number;
  locations?: LocationEvent[];
  observerTotalCatch?: {
    value: number;
    units: string;
    weightMethod?: string;
  };
  volume?: {
    value: number;
    units: string;
  };
  density?: {
    value: number;
    units: string;
  };
  gearType?: string;
  gearPerformance?: string;

  // TODO combine hook/ fixed gear data into a single interface?
  avgSoakTime?: number;
  totalHooks?: number;
  totalHooksLost?: number;
  gearSegments?: number;
  gearSegmentsLost?: number;

  beaufortValue?: number;
  targetStrategy?: string;
  deterrentUsed?: boolean;
  calWeight?: number;
  fit?: number;
  hlfc?: WcgopHlfc[];
  brd?: WcgopBrd[];

  isHaulUnsampled?: boolean;
  isGearLost?: boolean;
}
