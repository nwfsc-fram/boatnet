// Ashop Haul
import { BaseOperation } from '../_base/base-operation';
import { LocationEvent, Measurement, GearType } from '../_common/index';
import { AshopBrd, AshopSightingEvent, AshopCatch } from './index';

export const AshopHaulTypeName = 'ashop-haul';

declare type AshopGearPerformance = string; // TODO

// TODO: Create both Ashop Trawl and Fixed Gear haul types?
export interface AshopHaul extends BaseOperation {
  haulNum?: number;

  startFishingLocation?: LocationEvent; // ETL from Deploy
  endFishingLocation?: LocationEvent; // ETL from Retrieval

  bottomDepth?: Measurement;
  fishingDepth?: Measurement;
  // ETL units from DEPTH_METER_FATHOM
  // TODO Keep units in Fathoms - convert from Meters if needed

  observerEstimatedCatch?: {
    measurement: Measurement; // kg
    weightMethod: string; // TODO lookup AshopWeightMethod
  };

  vesselEstimatedCatch?: {
    measurement: Measurement; // MT
    weightMethod: string; // TODO lookup AshopWeightMethod
  };

  officialTotalCatch?: Measurement;
  // Calculated -
  // use observerEstimatedCatch if available,
  // otherwise vesselEstimatedCatch

  observerEstimatedDiscards?: {
    measurement: Measurement; // kg
    weightMethod: string;
    // TODO lookup AshopWeightMethod:
    // Calculated, Visual, Catcher Vessel
  }[];

  // Calculatd- sum of observerEstimatedDiscards
  totalEstimatedDiscard?: Measurement;

  gearType?: GearType;
  gearPerformance?: AshopGearPerformance; // TODO Lookup
  mammalMonitorPercent?: number; // 0 or 100
  isBirdShortwired?: boolean;
  isGearLost?: boolean;
  tribalDelivery?: string; // TODO name of tribe LOOKUP

  legacy?: {
    haulSeq?: number;
    deliveryVesselAdfg?: string;
    locationCode?: string; // R (Retrieval) or N (Noon)
    volume?: Measurement;
    density?: Measurement;
    haulPurposeCode?: string;
    cdqCode?: string;
    rbtCode?: string;
    rstCode?: string;
    birdHaulbackCode?: string;
    sampleUnit?: string;
  };

  catches?: AshopCatch[];
}
