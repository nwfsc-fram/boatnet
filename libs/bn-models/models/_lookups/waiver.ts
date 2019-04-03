import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const WaiverTypeName = 'waiver';

export interface Waiver extends Base { 
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
