// WCGOP Operation: Haul / Set (Fishing Activity)
import { BaseOperation } from '../_base/base-operation';
import {
  LocationEvent,
  Measurement,
  GearType,
  WeightMethod
} from '../_common/index';
import { WcgopCatch } from './wcgop-catch';

export const WcgopOperationTypeName = 'wcgop-operation';

declare type WcgopTargetStrategy = any; // TODO

// TODO: Create both WCGOP Trawl and Fixed Gear haul types?
export interface WcgopOperation extends BaseOperation {
  catches?: WcgopCatch[];
  operationNum?: number; // Sequential
  locations?: LocationEvent[];
  observerTotalCatch?: {
    measurement?: Measurement;
    weightMethod?: WeightMethod;
  };
  gearType?: GearType;
  gearPerformance?: string;
  targetStrategy?: WcgopTargetStrategy;
  isEfpUsed?: boolean;
  calWeight?: number;
  fit?: number;
  isOperationUnsampled?: boolean;
  isGearLost?: boolean;
  isDataQualityPassing?: boolean;

  // Set operation specific fields:
  avgSoakTime?: Measurement;
  // TODO: Derived from start/end time (calculated field) in minutes? confirm with Neil
  totalHooks?: number;
  totalHooksLost?: number;
  totalGearSegments?: number;
  gearSegmentsLost?: number;

  beaufortValue?: number; // Possibly replaced with tides/currents data
  isDeterrentUsed?: boolean; // HLFC related (possibly legacy - stored at trip leve)
  excluderType?: string; // BRD related (possibly legacy - stored at trip level)

  legacy?: {
    fishingActivityId: number;
    tripId: number;
    catchWeightKp?: number;
    catchCountKp?: number;
    volume?: Measurement;
    density?: Measurement;
  };
}
