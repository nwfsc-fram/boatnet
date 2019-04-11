import { CouchID, Measurement } from '../_common';
import { Media } from '../_lookups/media';
import { BoatnetUser } from './boatnet-user';
import {
  Beaufort,
  SpecimenTag,
  Species,
  Person,
  Confidence
} from '../_lookups';
import { Deterrent } from '../_lookups/deterrent';
import { BoatnetDate } from './boatnet-date';
import { Point } from 'geojson';
import { Base } from '../_base/index';
import { WcgopSpecimen } from '../wcgop';
import { AshopSpecimen } from '../ashop';

declare type InteractionType = string; // TODO Lookup

interface Interaction {
  type?: InteractionType;
  notes?: string;
  isLethal?: boolean;
} // TODO lookup type

interface OutcomeType {
  description?: string;
  isLethal?: boolean;
} // TODO lookup type

declare type Weather = string; // TODO Lookup
declare type VesselActivity = string; // TODO ASHOP Lookup: Fishing, Processing, etc

export interface InteractionEvent extends Base {
  hauls?: CouchID[];
  catchSpecies?: CouchID[]; // tied to Species Comp/ Specimen Record
  // TODO: Verify behavior of syntax for specimens:
  specimens?: WcgopSpecimen[] | AshopSpecimen[] | CouchID[];
  species?: Species;

  date?: BoatnetDate;
  location?: Point;
  beaufort?: Beaufort;
  confidenceOfSpecies?: Confidence; // Y/ N/ Unsure (TODO: Lookup)
  minAnimalCountEstimate?: number; // Previously minNumSightings
  maxAnimalCountEstimate?: number;
  animalCount?: number; // "Best", in UI, allow 1 Mammal only if isLethal == true

  take?: {
    // determined after the fact
    isTake?: boolean; // death or likely death
    reviewer?: Person;
    comments?: string;
  };
  closestApproach?: Measurement;

  deterrents?: Deterrent[];
  areAnimalsInjured?: boolean; // limit interaction choices in UI
  areAnimalsDead?: boolean; // limit interaction choices in UI
  interactions?: InteractionType[]; // TODO important - review. Limit to single isLethal interaction
  outcome?: OutcomeType; // Interaction uniquely defined by organism and outcome

  bodyLength?: Measurement; // lookup gives a range as text.  many notes i found gave more specific body size info
  mediaTaken?: boolean;
  mediaData: Media[];
  weather?: Weather;
  vesselActivity?: VesselActivity;

  legacy?: {
    waterTemp?: Measurement;
    sightingCondition?: string;
    eventNumber?: number;
    birdLocation?: string;
    numBirds?: number;
    countType?: string;
    goodLookAtBird?: boolean;
    duration?: Measurement; // Is this a universal attribute? TODO Possibly Delete

    // if short tailed albatross
    albatrossData?: {
      // consider non species specific
      numAdults?: number;
      numSubAdults?: number;
      numImmatures?: number;
      numJuveniles?: number;
      identifyingCharacteristics?: string;
      specimenTaken?: boolean;
      specimensAndTags?: SpecimenTag[];
    };
    numMammalsInInteraction?: number;
    mammalCondition?: string;
  };
}
