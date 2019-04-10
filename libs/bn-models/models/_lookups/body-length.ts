import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const BodyLengthTypeName = 'body-length';

export interface BodyLength extends Base { 
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
