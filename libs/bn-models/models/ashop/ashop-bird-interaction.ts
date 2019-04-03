import { Vessel } from "../_lookups/vessel";
import { BaseInteraction } from "../_base/base-interaction";
import { Measurement, Species, BoatnetUser, Fishery } from '../_common';
import { SpecimenTag } from "../_lookups/specimen-tag";

export interface AshopBirdInteraction extends BaseInteraction { 
    cruise?: number;
    permit?: string;
    eventNumber?: number;
    trip?: number;
    haul?: number;
    offload?: number;
    vessel?: Vessel;
    vesselActivity?: string;
    observer?: BoatnetUser;
    weatherCondition?: string;

    birdLocation?: string;
    fishery?: Fishery;
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
    specimentsAndTags?: SpecimenTag[];


    
}

