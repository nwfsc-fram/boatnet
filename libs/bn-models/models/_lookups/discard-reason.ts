import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const DiscardReasonTypeName = 'discard-reason';

export interface DiscardReason extends Base { 
    description?: string;
    lookupVal?: number;
    programId?: number;
    active?: boolean;
    sortOrder?: number;

    legacy?: {
        lookupId?: number
        obsprodLoadDate?: BoatnetDate;
    }
}


