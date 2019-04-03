import { CouchID, Measurement } from '../_common';
import { Media } from '../_lookups/media';
import { BoatnetUser } from './boatnet-user';
import {
  Beaufort,
  SpecimenTag,
  Species,
  Contact,
  Confidence
} from '../_lookups';
import { Deterrent } from '../_lookups/deterrent';
import { BoatnetDate } from './boatnet-date';
import { Point } from 'geojson';
import { Base } from '../_base';

declare type InteractionType = {
  description?: string;
  isLethal?: boolean;
}; // TODO lookup

declare type OutcomeType = string; // TODO lookup

export interface InteractionEvent extends Base {
  hauls?: CouchID[];
  species?: Species;
  catchSpecies?: CouchID[];
  confidenceOfSpecies?: Confidence; // Y/N/?
  date?: BoatnetDate;
  location?: Point;
  beaufort?: Beaufort;
  minNumSighted?: number;
  maxNumSighted?: number;
  bestNumSighted?: number;

  take?: {
    // determined after the fact
    isTake?: boolean; // death or likely death
    reviewer?: Contact;
    comments?: string;
  };
  closestApproach?: Measurement;

  areAnimalsInjured?: boolean; // limit interaction choices in UI
  areAnimalsDead?: boolean; // limit interaction choices in UI

  deterrents?: Deterrent[];
  interactions?: InteractionType[]; // TODO important - review. Limit to single isLethal interaction
  outcome?: OutcomeType; // Interaction uniquely defined by organism and outcome

  // TODO: Review below
  duration?: Measurement; // Is this a universal attribute?
  sightingCondition?: string;
  bodyLength?: string; // lookup gives a range as text.  many notes i found gave more specific body size info
  mediaTaken?: boolean;
  mediaData: Media[];

  // ashop bird
  eventNumber?: number;
  vesselActivity?: string;
  observer?: BoatnetUser;
  weatherCondition?: string;

  birdLocation?: string;
  numBirds?: number;
  countType?: string;
  goodLookAtBird?: boolean;

  // if short tailed albatross
  numAdults?: number;
  numSubAdults?: number;
  numImmatures?: number;
  numJuveniles?: number;
  identifyingCharacteristics?: string;
  specimenTaken?: boolean;
  specimensAndTags?: SpecimenTag[];

  // ashop mammal

  numMammalsInInteraction?: number;
  mammalCondition?: string;
  specimens?: {
    // will turn this into its own type
    specimenNum?: number;
    animalNum?: number;
    specimenType?: string;
    sex?: string;
    value?: string;
  }[];

  // "comments" section split like this only temporarily
  extraComments: {
    generalComments: {
      wasSampledForSpeciesComp?: boolean;
      speciesIdenficationDescription?: string;
      wasMarineMammalObserved?: boolean;
      observationDescription?: string; // if not observed, explain
      interactionDescription?: string;
      sexDeterminationMethod?: string; // unsure where this one belongs
      conditionOfAnimal?: string;
      injuries?: string;
      uncertainties?: string;
    };

    feedingComments: {
      proximity?: Measurement;
      targetSpecies?: Species;
      typeOfBait?: string;
      evidenceOfFeeding?: string;
      depredatedFish?: Species;
      numFishWithDepredation?: number; // fish with evidence of depredation
      numHooksWithFishPartsRemaining?: number;
      sizeGashesOnFish?: Measurement;
    };

    entanglementComments: {
      componentsOfGear?: string;
      animalFreeingMethod?: string;
      partsOfAnimalWithGear?: string;
      unseenPartsOfAnimal?: string;
      lostGear?: string;
      injuriesSustained?: string;
      behaviorBefore?: string;
      behaviorAfter?: string;
    };
  };

  legacy?: {
    waterTemp?: Measurement;
  };
}
