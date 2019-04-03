// tslint:disable no-empty-interface
import { Measurement, BoatnetDate, BoatnetUser, Species } from "../_common";
import { Point } from 'geojson'; // GeoJSON https://tools.ietf.org/html/rfc7946
import { Base } from "../_base";
import { Vessel } from "../_lookups/vessel";
import { Confidence } from "../_lookups/confidence";
import { Beaufort } from "../_lookups/beaufort";
import { Media } from "../_lookups/media";

export interface AshopSightingEvent extends Base {
    cruise?: number;
    permit?: string;
    species?: Species[];
    observers?: BoatnetUser[];
    vessel?: Vessel;
    date?: BoatnetDate;
    location?: Point;
    generalLocation?: string;
    sightingConditions?: string;
    waterTemp?: string;
    confidentOfSpecies?: Confidence;
    beaufort?: Beaufort;
    closestApproach?: Measurement;
    minNumSighted?: number; 
    maxNumSighted?: number; 
    bestNumSighted?: number; 
    interactionBehaviors?: string[];
    interactionOutcome?: string[]; 
    sightingCue?: string;
    mediaTaken?: boolean;
    mediaData: Media[];

    extraComments?: {
        generalComments?: {
            dorsalFinDescription?: string;
            bodyLength?: string;
            bodyShape?: string;
            snoutDescription?: string;
            colorPatterns?: string;
            blowDescription?: string;
            scarsAndScratches?: string;
            behaviorDescription?: string;
            associatedOrganisms?: string[];
        }

        shorthairedAlbatrossTake?:{
            gearSetting?: string;
            floatsAttached?: boolean;
            longlineWeighted?: boolean;
            longlineWeightDescription?: string;
            settingSpeed?: Measurement;
            settingDirection?: string;
            skyCondition?: string;
            baitUsed?: string;
            offalBeingDischarged?: boolean;
            streamerLineCondition?: string;
            steamerLinesAlongBait?: boolean;
        }
    
        // Some of this info is repeated
        byCatchandBirdComments?: {
            carcassCondition?: string;
            numOtherBirdsCaught?: number;
            otherBirdsTaken?: boolean;
            otherBirds?: Species[];
            moreAlbatrossThanUsualDaysBefore?: boolean;
            moreAlbatrossThanUsualDayOf?: boolean;
            numShortTailedAlbatross?: number;
            numBirdsInArea?: number;
            didBirdsBehaveUnusual?: boolean;
            didBirdsSeemMoreAggressive?: boolean;
            
        }
        
        // more as needed
    }









}
