// WCGOP Haul
import { BaseOperation } from '../_base/base-operation';
import { LocationEvent, Measurement } from '../_common/index';
import { WcgopBrd, WcgopHlfc } from './index';
import { WcgopSightingEvent } from './wcgop-sighting-event';

export const WcgopSetTypeName = 'wcgop-set';

// TODO: Create both WCGOP Trawl and Fixed Gear haul types?
export interface WcgopSet extends BaseOperation {
  // catches?: WcgopCatch[];  // TODO
  haulNum: number;
  locations?: LocationEvent[];
  observerTotalCatch?: {
    measurement?: Measurement;
    weightMethod?: string;
  };
  volume?: Measurement;
  density?: Measurement;
  gearType?: string;
  gearPerformance?: string;
  isEfpUsed?: boolean;

  isDeterrentUsed?: boolean;

  avgSoakTime?: Measurement; // minutes? confirm with Neil
  totalHooks?: number;
  totalHooksLost?: number;
  totalGearSegments?: number;
  gearSegmentsLost?: number;

  excluderType?: string; // TODO lookup

  beaufortValue?: number;
  targetStrategy?: string;
  calWeight?: number;
  fit?: number;

  isHaulUnsampled?: boolean;
  isGearLost?: boolean;

  isDataQualityPassing?: boolean;

  legacy?: {
    fishingActivityId: number;
    tripId: number;
    hooksSetKp: number;
    sampleWeightKp?: number;
    sampleCountKp?: number;
  };
}
