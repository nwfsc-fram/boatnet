import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const InteractionBehaviorTypeName = 'interaction-behavior';

export interface InteractionBehavior extends Base { 
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
