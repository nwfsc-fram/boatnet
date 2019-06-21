import { Base } from '../_base';
import { BoatnetDate, CouchID} from '../_common';
import { Fishery, Vessel, Organization, Person } from '../_lookups';

declare type PermitType = string; // NOAA Fisheres, WDFW, ODFW, CDFW

/*
1. Vessel Covered
- Drop these ones off

2. Permit Rollovers - Vessel has high likelihood of fishing, just not at this time
- e.g. Nearshore - they fish hard, but they must do it in the summer, even
        though they're selected for Jan-Feb
        They will fish, just not yet

    Permit Rollovers
    - Vessel/Permit selected for Jan-Feb, but they don't fish those months
    - Logic
        -- When vessel takes trip with observer during selection
            period, need to know if they've had a landing
        -- If they have a landing during that period, then it
            won't rollover
        -- Otherwise rollover it over to what ???

3. Vessel likely not to fish
- Want to query if they're making landings so we could catch it
    and get an observer on there

4. Guranted will not fish

Permit Transfers
- How do keep track of permit's history?  Possible transfer types
    a. Transfer permit from boat A to boat B
    b. Transfer permit from owner C to owner D
    c. Transfer permit from boat A, owner C to boat B, owner D
    d. Transfer permit and/or vessel to new port group

Our permits approach:  consume all of the active and inactive
    permits from NMFS permits system

    A transfer would represent a closing of one permit record
        and an opening of a new record
*/

export interface Permit extends Base {
    permitType: PermitType;
    permitNumber: string; // ODFW = Number

    // TODO what are the certificateStart/End dates?
    // TODO what arethe permitStartDate / permitEndDate?

    certificateStartDate: BoatnetDate; // What do these dates represent?
    certificateEndDate: BoatnetDate; // What do these dates represent?
    owner: Person | Organization;
    vessel: Vessel; // Use federal data first, then state if needed
    isTrawlGear?: boolean;
    isLonglineGear?: boolean;
    isTrapPotGear?: boolean;
    isSmallFleet?: boolean;
    endorsedLength?: number;
    isSableFishEndorsed?: boolean;
    sableFishTier?: string; // Tiers 0, 1, 2, 3 (1-3 = LE, 0 = 0 Tier)
    isCpEndorsed?: boolean;
    isMsEndorsed?: boolean;
    isMothershipCatcherVessel?: boolean;
    whitingPercent?: number;
    whitingAssignment?: number;
    isOwnerOnBoardExempt?: boolean;
    status?: string;
    goid?: string;
    ghid?: string;

    // State General Fields
    fishery?: Fishery;

    // WDFW-specific Fields

    // ODFW-specific Fields
    year?: number;
    potLimit?: number;

    // CDFW-specific Fields
}
