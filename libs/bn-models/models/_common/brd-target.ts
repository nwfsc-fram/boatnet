import { Base } from "../_base";
import { BoatnetDate } from "./boatnet-date";

// species / complex codes - what is a complex?


export const BrdTargetTypeName = 'brd-target-type';

export interface BrdTarget extends Base {
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