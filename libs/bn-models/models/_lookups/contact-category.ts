import { Base } from "../_base";
import { BoatnetDate } from "../_common";

export const ContactCategoryTypeName = 'contact-category';

export interface ContactCategory extends Base { 
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
