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
import { BirdBand } from '../_lookups/bird-band';
import { InteractionOutcome } from '../_lookups/interaction-outcome';
import { InteractionType } from '../_lookups/interaction-type';

declare type Interaction = {
  type?: InteractionType;
  notes?: string;
  isLethal?: boolean;
}; // if multiple interactions we need to keep track of descriptive notes for each


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
  interactions?: Interaction[]; // TODO important - review. Limit to single isLethal interaction
  outcome?: InteractionOutcome; // Interaction uniquely defined by organism and outcome

  // TODO: Review below
  duration?: Measurement; // Is this a universal attribute?
  sightingCondition?: string;
  bodyLength?: string; // lookup gives a range as text.  many notes i found gave more specific body size info
  mediaTaken?: boolean; // simple flag
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

  // if short tailed albatross, perhaps change to general endangered species flag
  numAdults?: number;
  numSubAdults?: number;
  numImmatures?: number;
  numJuveniles?: number;
  identifyingCharacteristics?: string;
  specimenTaken?: boolean;
  specimensAndTags?: SpecimenTag[]; // specimenTag needs review

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


  // WCGOP possible notes (listed from form):
  wcgopComments:{
    // mammal
    bodyFeatures: string;
    associatedOrganisms: string[];   

    bodyShape?: string;
    headShape?: string;
    dorsalFinShape?: string;
    coloration?: string;
    markings?: string; // scratches / scars / dents
    orcaSaddlePatch?: string; // description of
    blowDescription?: string;


    // bird
    headColor?: Measurement;
    wingColor?: Measurement;

    billSize?: string;
    billShape?: string;
    billColor?: Measurement;

    bodySize?: string;
    bodyShape?: string;
    bodyColor?: Measurement;

    feetSize?: string;
    featShape?: string;
    feetColor?: string;

    footColor?: Measurement;
    birdBands?: BirdBand[];

    // Turtle 
    shellType?: string; // hard / soft
    numCostalScutes?: number;
    numPairsPrefrontalScales?: number;
    color?: Measurement;
    
  }



  // A-SHOP possible notes (parsed from observer manual): 
  ashopComments: {
    mammalComments: {
      wasMarineMammalObserved?: boolean;
      observationDescription?: string; // if not observed, explain

      distinguishingCharacteristics?: string; // how was species identified
      markings?: string; // scars, marks, spotting, etc.
      wasSampledForSpeciesComp?: boolean;
      interactionDescription?: string;
      sexDeterminationMethod?: string; // how sex was identified
      conditionOfAnimal?: string; // general wellfare: healthy / injured / rotting, etc
      injuriesDescription?: string; // unsure if this means previous injuries
      uncertainties?: string; // general uncertainties of data
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
