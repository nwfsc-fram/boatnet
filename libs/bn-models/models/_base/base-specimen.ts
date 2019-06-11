import { Base } from './base';
import {
  Measurement,
  Biostructure,
  LocationEvent,
  LinealMeasurement
} from '../_common/index';
import { Media, Species, Protocol, OtsTargetType } from '../_lookups/index';

// TODO create lookups for these:
declare type Sex = string;
declare type Viability = string;
declare type LifeStage = string;
declare type Population = string;
declare type MaturityTable = string; // TODO Lookup - description
export interface Maturity {
  maturityTable?: MaturityTable;
  sex?: Sex;
  stage?: string;
  stageCode?: number;
  description?: string; // might include identifying characteristcs
} // TODO Species-specific tables for maturies

declare type TagType = string; // CWT, Band, Branding, etc.
declare type TagSubType = string; // CWT, Band, etc.
declare type TagLocation = string; // where the band ID was ...
declare type CwtStatus = string; //
export interface Tag {
  type: TagType;
  subtype: TagSubType;
  code: string; // alphanumeric - cwtcode
  location?: TagLocation;
  status?: CwtStatus; // Tag Read - Ok, Tag Lost, Head Not Processed, etc.
}

export interface SpecialProject {
  tbd?: any;
}

export interface BaseSpecimen extends Base {
  sex?: Sex; // TODO Lookup
  length?: LinealMeasurement;
  width?: LinealMeasurement;
  weight?: Measurement;
  viability?: Viability;
  lifeStage?: LifeStage;
  visualMaturity?: Maturity;
  biostructures?: Biostructure[];
  tags: Tag[];
  isAdiposePresent?: boolean; // Hatchery v. Wild

  numSpecimensInBag?: number; // TODO ?? We think this is a bag of specimens
  location?: LocationEvent; // where was the boat when the specimen was collected

  frequency?: number; // = 1 if undefined (WCGOP only)
  mediaData: Media[];

  specialProject?: SpecialProject[]; // Actual data collected
}
