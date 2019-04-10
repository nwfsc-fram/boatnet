import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const InteractionTypeTypeName = 'interaction-type';

export interface InteractionType extends Base { 
    description?: string;
    lookupVal?: number;

    legacy?: {
        programId?: number;
        active?: boolean;
        sortOrder?: number;
        lookupId?: number
        obsprodLoadDate?: BoatnetDate;
        lookupType?: string;
    }
}
