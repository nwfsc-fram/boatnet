import { Base } from "../_base";
import { Port } from "./port";
import { BoatnetDate } from "./boatnet-date";

// TODO Full implementation
export const ContactTypeName = 'contact';


export interface Contact extends Base {

    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    workPhone?: string;  // Possible TODO: make custom phone number type for standardization purposes
    homePhone?: string;
    workEmail?: string;
    homeEmail?: string; 
    epribIdNum?: string;
    epirbSerialNum?: number;
    portId?: Port;
    contactType?: string; // Lookup value
    contactCategory?: string; // Looku value
    relationToObserver?: string; // Lookup value
    birthdate?: BoatnetDate; 
    license?: string; 
    epirbIdNum_2?: string; // Uncertain why there's a second one, legacy?

    legacy?:{
        contactId?: number;
        userId?: number; 
        obsprodLoadDate?: BoatnetDate;

    }
}