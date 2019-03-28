import { Base } from "../_base";

// TODO Full implementation
export const VesselLogbookTypeName = 'vessel-logbook-type';

export interface VesselLogbookType extends Base {
    description: string;

    legacy: {
        lookupId: number;
        lookupValue: string;
        programId: number;
    }
}
