import { Base } from '../_base';
import { BoatnetDate, CouchID} from '../_common';

export interface Permit extends Base {
    permitNumber: string;
    certificateStartDate: BoatnetDate;
    certificateEndDate: BoatnetDate;
    permitOwner: string;
    permitOwnerAddress: string;
    permitOwnerCity: string;
    permitOwnerState: string;
    permitOwnerZip: string;
    vesselName: string;
    vesselId: CouchID;
    vesselRegNum: string;
    trawlGear?: boolean;
    longlineGear?: boolean;
    trapPotGear?: boolean;
    smallFleet?: boolean;
    endorsedLength?: number;
    sableFishEndorsement?: boolean;
    sableFishTier?: string;
    cpEndorsement?: boolean;
    msEndorsement?: boolean;
    mothershipCatcherVessel?: boolean;
    whitingPercent?: number;
    whitingAssignment?: number;
    ownerOnBoardExempt?: boolean;
    status?: 'string';
    goid?: string;
    ghid?: string;
}
