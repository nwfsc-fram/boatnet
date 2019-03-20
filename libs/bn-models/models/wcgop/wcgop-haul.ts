// WCGOP Haul
import { BaseOperation } from '../_base/base-operation';
import { LocationEvent, Measurement, GearType } from '../_common/index';
import { WcgopBrd, WcgopHlfc } from './index';
import { WcgopSightingEvent } from './wcgop-sighting-event';
import { WcgopCatch } from './wcgop-catch';

export const WcgopHaulTypeName = 'wcgop-haul';

declare type WcgopTargetStrategy = any; // TODO

// TODO: Create both WCGOP Trawl and Fixed Gear haul types?
export interface WcgopHaul extends BaseOperation {
  haulNum: number;
  locations?: LocationEvent[];
  observerTotalCatch?: {
    measurement?: Measurement;
    weightMethod?: string;
  };
  gearType?: GearType;
  gearPerformance?: string;
  beaufortValue?: number;
  volume?: Measurement;
  density?: Measurement;
  targetStrategy?: WcgopTargetStrategy;
  isEfpUsed?: boolean;

  excluderType?: string; // TODO lookup

  isDeterrentUsed?: boolean;
  calWeight?: number;
  fit?: number;

  isHaulUnsampled?: boolean;
  isGearLost?: boolean;

  isDataQualityPassing?: boolean;

  legacy?: {
    fishingActivityId: number;
    tripId: number;
    catchWeightKp?: number;
    catchCountKp?: number;
  };

  catches?: WcgopCatch[];
}
