import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const ContactTypeTypeName = 'contact-type';

export interface ContactType extends Base { 
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
