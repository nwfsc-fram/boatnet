import { Base } from "./base";
import { CouchID, BoatnetDate, Measurement, Species } from "../_common";
import { Point } from 'geojson'; // GeoJSON https://tools.ietf.org/html/rfc7946

// species sightings based off of mmsbst form provided by neil
// subject to change once i get a chance to examine the a-shop mammal form
export interface BaseMmsbst extends Base { 
    trip?: CouchID;
    hauls?: CouchID[];
    date?: BoatnetDate;
    uscg?: string; // may be number, currently unknown 
    sightingCondition?: string; // lookup
    location?: Point;
    beaufort?: string; // lookup
    waterTemp?: Measurement;
    species?: Species;
    confidentOfSpecies?: string; // lookup, sure/likely/unsure, A-SHOP uses simple sure/unsure. Does wcgop absolutely need the three options?
    bodyLength?: string; // lookup gives a range as text. going forward I think this should be legacy, many notes i found gave more specific body size info
    closestApproach?: Measurement;
    minNumSighted?: number; 
    maxNumSighted?: number; 
    bestNumSighted?: number; 

    // All mmsbst record types have behaviors, but entirely different values in each, if we make a lookup doc for this we might move this val to lower levels
    interactionBehaviors?: string[]; // lookup 

    interactionOutcome?: string; // lookup
    photosOrVideosTaken?: boolean;
}

