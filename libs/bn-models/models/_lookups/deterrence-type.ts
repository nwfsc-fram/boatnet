import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const DeterrenceTypeTypeName = 'deterrence-type';

export interface DeterrenceType extends Base { 
    description?: string;
    lookupVal?: number;

    legacy?: {
        lookupId?: number
        obsprodLoadDate?: BoatnetDate;
        programId?: number;
        active?: boolean;
        sortOrder?: number;
    }
}
