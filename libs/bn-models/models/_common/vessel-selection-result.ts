import { Base } from '../_base';
import { Fishery, Vessel, PortGroup, Permit } from '../_lookups';
import { BoatnetDate } from './boatnet-date';
import { CouchID } from './couch-id';

declare type RolloverStatus = string; // TODO Lookup
    // Options include:  Vessel Covered, Permit Rollover, Likely not to fish
    //                  Guaranteed will not fish
export const VesselSelectionResultTypeName = 'vessel-selection-result';

export interface VesselSelectionItem {

    // May store the CouchID or the actual Vessel or Permit record in here
    item: CouchID; // Vessel | Permit; // West Coast Open Access + IPHC use Vessel, otherwise Permit
        // We need the permit contact info to let them know that
        // congratulations, you've been selected
        // Name, Phone, Address, City, State, Zip Code

    rolloverStatus?: RolloverStatus; //
    isSelected?: boolean;
}

declare type LetterEventType = string; // TODO Lookup

export interface LetterEvent {
    eventType: LetterEventType;
    eventDate: BoatnetDate;
    comment?: string;
}

// VesselSelectionResult is the result of the selection algorithms
export interface VesselSelectionResult extends Base {
    fishery: Fishery;
    startDate?: BoatnetDate; // Month + Year only
    endDate?: BoatnetDate; // Month + Year only
    selectionItems?: VesselSelectionItem[]; // Vessel or Permit
    // CA Nearshore - they can have a shallow and deep permit, only one of
    //    which should be selected in a given year

    // otherCoveredPermits?: Permit[];

    // Permits that aren't assigned to a vessel or
    //    an unknown vessel - only in LE Sablefish

    // Permit tracking - from the time a vessel is selected (in Nov),
    // a permit may have moved to a new vessel before it's selected
    // period.  We need to keep track of which vessel/owner has the permit

    // portGroup assigned where majority of vessel landings occurred
    // from the previous two years
    portGroup: PortGroup;
    letterHistory?: LetterEvent[];
    isLetterUndeliverable?: boolean; // Query API for UPS / USPS
        // https://www.usps.com/business/web-tools-apis/track-and-confirm-api.htm
        // https://www.ups.com/us/en/tracking/api.page

    associatedTrips?: CouchID[]; // vessel + period + fishery linkage

    isSelected: boolean;

    legacy: {
        cycleNumber: number;
        periodNumber: number;
    };
}
