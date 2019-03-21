import { Base } from './base';
import {
  Species,
  Measurement,
  Biostructure,
  LocationEvent
} from '../_common/index';

// TODO create lookups for these:
declare type Sex = string;
declare type Viability = string;
declare type LifeStage = string;
declare type Population = string;
declare type Maturity = string;
declare type Protocol = string; // TODO Protocol interface

export interface BaseSpecimen extends Base {
  species?: Species; // TODO needed?
  sex?: Sex; // TODO Common Lookup
  length?: Measurement;
  width?: Measurement;
  weight?: Measurement;
  viability?: Viability;
  lifeStage?: LifeStage;
  population?: Population; // Probably for Trawl
  maturity?: Maturity;
  cutting?: Biostructure; // for Corals / Sponges/ etc
  finClip?: Biostructure;
  finRay?: Biostructure;
  otolith?: Biostructure;
  ovary?: Biostructure;
  tissue?: Biostructure;
  stomach?: Biostructure;
  scales?: Biostructure;
  snout?: Biostructure;
  wholeSpecimen?: Biostructure;
  numSpecimens?: number; // TODO ?? We think this is a bag of specimens
  location?: LocationEvent;
  protocol?: Protocol;
  specialProjects?: any; // arbitrary special project data
  frequency?: number; // 1 if undefined
}
