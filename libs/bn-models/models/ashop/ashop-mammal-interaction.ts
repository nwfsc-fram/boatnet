import { Vessel } from "../_lookups/vessel";
import { BaseInteraction } from "../_base/base-interaction";
import { Measurement, Species } from '../_common';

export interface AshopMammalInteraction extends BaseInteraction { 
    cruise?: number;
    permit?: string;
    trip?: number;
    haul?: number;
    offload?: number;
    numMammalsInInteraction?: number;
    vessel?: Vessel;
    mammalCondition?: string
    specimens?: { // will turn this into its own type 
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
        }

        feedingComments: {
            proximity?: Measurement;
            targetSpecies?: Species;
            typeOfBait?: string;
            evidenceOfFeeding?: string;
            depredatedFish?: Species;
            numFishWithDepredation?: number; // fish with evidence of depredation
            numHooksWithFishPartsRemaining?: number;
            sizeGashesOnFish?: Measurement;
        }

        entanglementComments: {
            componentsOfGear?: string;
            animalFreeingMethod?: string;
            partsOfAnimalWithGear?: string;
            unseenPartsOfAnimal?: string;
            lostGear?: string;
            injuriesSustained?: string;
            behaviorBefore?: string;
            behaviorAfter?: string; 
        }
    }
}

