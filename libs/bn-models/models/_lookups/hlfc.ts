import { Base } from "../_base";
import { BoatnetUser, CouchID, Measurement } from "../_common";


export interface hlfc extends Base {
    observer?: BoatnetUser;
    trip?: CouchID;
    hauls?: CouchID[];
    productDeliveryState?: string;
    avgSpeed?: Measurement;
    avgNumHooks?: number;
    floatsUsed?: boolean;
    floatsPerSkate?: number;
    weightsUsed?: boolean;
    massPerWeight?: Measurement;
    avgNumWeights?:number;
    isBirdAvoidanceGearUsed?: boolean;
    mitigationTypes?: string[]; // lookup
    isStreamerLineUsed?: boolean;
    avgArialExtent?: Measurement // < 40 or >=40 right now, the data in the DB doesnt match this. It seems bad design currently
    avgHorizontalExtent?: Measurement // < 2 or >= 2 right now, seems bad design. Notes occasionally provided more accurate info.  

    // Noticable number of comments mention (widely) varying speeds, we might want to capture this going forward
    // Noticable number of comments also mention specific methods of mitigation listed as "other", such as "bird banger", might want to add these to built in selections
}