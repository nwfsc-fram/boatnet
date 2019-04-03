import { Base } from "./base";
import { CouchID, BoatnetDate, Measurement, Species } from "../_common";
import { Point } from 'geojson'; // GeoJSON https://tools.ietf.org/html/rfc7946
import { Beaufort } from "../_lookups/beaufort";
import { Confidence } from "../_lookups/confidence";
import { Media } from "../_lookups/media";
import { Deterrence } from "../_lookups/deterrence";
import { Vessel } from "../_lookups/vessel";

export interface BaseInteraction extends Base { 
    species?: Species;
    confidentOfSpecies?: Confidence;
    deterrenceUsed?: Deterrence[];
    isDeterrenceSuccessful?: boolean;
    date?: BoatnetDate;
    location?: Point;
    beaufort?: Beaufort;
    minNumSighted?: number; 
    maxNumSighted?: number; 
    bestNumSighted?: number; 
    
    closestApproach?: Measurement;

    wasAnimalInjured?: boolean;

    interactionBehaviors?: string[];
    interactionOutcome?: string[]; 

    duration?: Measurement; // Is this a universal attribute? 
}

