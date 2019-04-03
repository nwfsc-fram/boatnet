import { CouchID, Measurement } from "../_common";
import { Media } from "../_lookups/media";
import { BaseInteraction } from "../_base/base-interaction";

export interface WcgopMmsbstBase extends BaseInteraction { 
    trip?: CouchID;
    hauls?: CouchID[];
    uscg?: string;
    waterTemp?: Measurement; 
    sightingCondition?: string; 
    bodyLength?: string; // lookup gives a range as text.  many notes i found gave more specific body size info
    mediaTaken?: boolean;
    mediaData: Media[];

}

