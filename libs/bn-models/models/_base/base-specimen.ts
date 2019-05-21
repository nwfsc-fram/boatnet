import { Base } from './base';
import {
  Measurement,
  Biostructure,
  LocationEvent,
  LinealMeasurement
} from '../_common/index';
import { Media, Species, Protocol } from '../_lookups/index';

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

export interface BaseSpecimen extends Base {
  sex?: Sex; // TODO Lookup
  length?: LinealMeasurement;
  width?: LinealMeasurement;
  weight?: Measurement;
  viability?: Viability;
  lifeStage?: LifeStage;
  population?: Population; // Probably for Trawl Survey
  visualMaturity?: Maturity;

  biostructures?: Biostructure[];
  // TODO How do we handle special project PI?

  numSpecimensInBag?: number; // TODO ?? We think this is a bag of specimens
  location?: LocationEvent;
  protocol?: Protocol; // Include sampling strategy (randomly selected, etc.)
  // Canary - Sl100 AW25 OvTiFc

  specialProjects?: any[]; // TODO move to Protocol: arbitrary special project data
  frequency?: number; // = 1 if undefined (WCGOP only)

  mediaData: Media[];
}
