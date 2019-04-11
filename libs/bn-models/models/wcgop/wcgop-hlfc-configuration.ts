import { BoatnetUser, CouchID, Measurement } from "../_common";
import { Base } from "../_base";

export const WcgopHlfcConfigurationTypeName = 'wcgop-hlfc-configuration';

declare type HlfcProductDeliveryState = string; // TODO Lookup
declare type HlfcMitigationType = string; // TODO Lookup
declare type HlfcAerialExtent = string; // < 40 or >=40 right now, the data in the DB doesnt match this. It seems bad design currently
declare type HlfcHorizontalExtent = string; // < 2 or >= 2 right now, seems bad design. Notes occasionally provided more accurate info.


export interface WcgopHlfcConfiguration extends Base {
    operations?: CouchID[];
    productDeliveryState?: HlfcProductDeliveryState;
    avgSpeed?: Measurement;
    floatsUsed?: boolean;
    floatsPerSegment?: number;
    sinkersUsed?: boolean;
    weightPerSinker?: Measurement; // oz or lbs
    avgNumSinkersPerSegment?:number;

    mitigationTypes?: HlfcMitigationType[]; // Pulled from Operations
    avgAerialExtent?: HlfcAerialExtent; // Streamer Line related
    avgHorizontalExtent?: HlfcHorizontalExtent; // Streamer Line related

    legacy?: {
        avgNumHooksPerSegment?: number; // pull up to WcgopOperation
    }
    // Noticable number of comments mention (widely) varying speeds,
    // we might want to capture this going forward
    // Noticable number of comments also mention specific methods
    // of mitigation listed as "other", such as "bird banger",
    // might want to add these to built in selections
}