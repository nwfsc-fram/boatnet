// WCGOP Operation: Haul / Set (Fishing Activity)
import { BaseOperation } from '../_base/base-operation';
import {
  LocationEvent,
  Measurement,
  BoatnetDate,
  CouchID
} from '../_common/index';
import { HakeSurveyNetEvent } from './hake-survey-net-events';
import { Polygon, MultiLineString } from 'geojson';
import { Person } from '../_lookups';
import { HakeSurveyCatch } from './hake-survey-catch';

declare type HaulType = string; // Midwater tow, Bottom tow, Methot Tow
declare type Performance = string; // Convert the numeric codes to the descriptive values
declare type PerformanceCode = number;
declare type SubsampleCode = string; // Get descriptions from Alicia 
declare type InfpcSubArea = {
  code: number;
  name: string;
  polygon: Polygon;
}; 
declare type DoorType = string; //
export interface Equipment {
  type: string;
  name: string;
  location: string;
}
declare type Transect = {
  code: number;
  polyline: MultiLineString
}

declare type TomWeights = string; // TODO - 200lbs, 250lbs, 500lbs, 750lbs
declare type LinerSizes = string; // TODO - 7mm, 32mm
declare type GearType = string; // TODO - AWT - Aleutian Wing Trawl
export const HakeSurveyOperationTypeName = 'hake-survey-operation';

// TODO: Create both WCGOP Trawl and Fixed Gear haul types?
export interface HakeSurveyOperation extends BaseOperation {

  operationNum?: number; // Sequential
  haulType: HaulType; //
  performance: Performance[]; // existing is numeric, could be descriptive
  isBiomassAcceptable: boolean;
  netEvents: HakeSurveyNetEvent[];
  duration: Measurement; // Derived - in minutes?
  distanceFished: Measurement; // Derived - nautical miles
  stratum: InfpcSubArea; // INFPC - TODO ETL - check if EQ_LATITUDE is in INFPC area
      // update the stratum as needed
  averageBottomDepth?: Measurement // meters
  gearType?: GearType; // AWT (Aleutian Wing Trawl)
  doorType?: DoorType; //
  tomWeights?: TomWeights; // e.g. 250 lbs (historical data) up to 750 lbs (currently)
  linerSize?: LinerSizes; // e.g. in inches or millemeters
  cameras?: Equipment[];
  tempDepthRecorders?: Equipment[]; // ETL BT_NUMBER (haul) / MBT_NUMBER (gear) into this
  flowMeter?: Equipment; // measures how much water is coming through
  fisher: Person;
  netHeight: Measurement; // meters
  averageFootropeDepth: Measurement; // derived - meters - headrope depth + net height
  surfaceTemperature: Measurement; // degC
  gearTemperature: Measurement;  // degC
  averageWireout: Measurement; // meters
  transect: Transect; // 

  catches?: HakeSurveyCatch[];

  legacy: {
    gearCode: number; // 307
    perfomanceCode?: PerformanceCode[]; //
    accessoryCode: number; // a bunch of components combined
  };

}
