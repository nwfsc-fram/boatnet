import { Base } from '../_base';
import { BoatnetDate, CouchID} from '../_common';
import { Fishery, Vessel, Organization, Person } from '../_lookups';

declare type PermitType = string; // NOAA Fisheres, WDFW, ODFW, CDFW

export interface Permit extends Base {
    permitType: PermitType;
    permitNumber: string; // ODFW = Number
    certificateStartDate: BoatnetDate;
    certificateEndDate: BoatnetDate;
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
    year: number;
    potLimit: number;

    // CDFW-specific Fields
}
