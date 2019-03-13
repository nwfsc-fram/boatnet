import { Base } from './base';
import {
  Species,
  Measurement,
  Biostructure,
  LocationEvent
} from '../_common/index';

export interface BaseSpecimen extends Base {
  species?: Species; // TODO needed?
  sex?: string;
  length?: Measurement;
  width?: Measurement;
  viability?: string; // TODO lookup
  lifeStage?: string; // TODO lookup
  population?: string; // TODO lookup
  cutting?: Biostructure; // for Corals / Sponges/ etc
  finClip?: Biostructure;
  age?: Biostructure;
  ovary?: Biostructure;
  tissue?: Biostructure;
  stomach?: Biostructure;
  wholeSpecimen?: Biostructure;
  numSpecimens?: number; // TODO ?? We think this is a bag of specimens
  location?: LocationEvent;
  protocol?: any; // TODO Protocol interface
  specialProjects?: any; // arbitrary special project data
}
