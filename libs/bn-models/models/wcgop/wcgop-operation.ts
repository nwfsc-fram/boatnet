// WCGOP Operation: Haul / Set (Fishing Activity)
import { BaseOperation } from '../_base/base-operation';
import {
  LocationEvent,
  Measurement,
  BoatnetDate,
  CouchID
} from '../_common/index';
import { WcgopCatch } from './wcgop-catch';
import { WeightMethod, GearType } from '../_lookups';

export const WcgopOperationTypeName = 'wcgop-operation';

declare type WcgopTargetStrategy = any; // TODO
declare type ProductDeliveryState = any; // TODO Lookup

// TODO: Create both WCGOP Trawl and Fixed Gear haul types?
export interface WcgopOperation extends BaseOperation {
  biolist?: number;
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
  sightingEventIds?: CouchID[];
  productDeliveryState?: ProductDeliveryState;
  beaufortValue?: number; // Possibly replaced with tides/currents data


  // Set operation specific fields:
  avgSoakTime?: Measurement;
  // TODO: Derived from start/end time (calculated field) in minutes? confirm with Neil
  totalHooks?: number;
  totalHooksLost?: number;
  totalGearSegments?: number;
  gearSegmentsLost?: number;
  hooksSampled?: number; // Pull up from WcgopCatch records (should be the same number)
  avgNumHooksPerSegment?: number; // auto-calculate, new data field
  // Combine BRD and HLFC into isDeterrentUsed
  isDeterrentUsed?: boolean; // BRD/ HLFC related (prompt UI for details required)

  avgSetSpeed?: Measurement; // Longline + Snap gear types only
  floatsUsed?: boolean; // Longline + Snap gear types only
  floatsPerSegment?: number; // Longline + Snap gear types only
  sinkersUsed?: boolean; // Longline + Snap gear types only
  weightPerSinker?: Measurement; // oz or lbs - Longline + Snap gear types only
  avgNumSinkersPerSegment?: number; // Longline + Snap gear types only

  legacy?: {
    fishingActivityId?: number;
    tripId?: number;
    catchWeightKp?: number;
    catchCountKp?: number;
    volume?: Measurement;
    density?: Measurement;
    obsprodLoadDate?: BoatnetDate;
    excluderType?: string; // BRD related
    isBrdPresent?: boolean; // combine into isDeterrentUsed
    deterrentUsed?: string; // translate into mitigationTypes HLFC record (values translate to mitigation type)
  };
}
