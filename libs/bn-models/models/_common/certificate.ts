import { Base } from "../_base";
import { BoatnetDate } from "./boatnet-date";


export const WcgopSightingTypeName = 'certificate';

export interface Certificate extends Base {
    certificateNumber?: string;
    certificationId?: number; 

    legacy?: {
        tripCertificateId?: number;
        tripId?: number;
        obsprodLoadDate?: BoatnetDate;
    }
}
