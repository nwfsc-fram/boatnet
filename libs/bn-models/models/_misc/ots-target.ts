import { Base } from '../_base';
import { Fishery } from '../_lookups';
import { BoatnetDate, CouchID } from '../_common';

export interface OtsTarget extends Base {
    fishery: string;
    targetType: string;
    targetVesselID?: CouchID;
    targetVesselName?: string;
    targetVesselCGNumber?: string;
    targetPortGroupID?: CouchID;
    targetPortGroupDescription?: string;
    coverageGoal: number;
    setRate: number;
    effectiveDate: BoatnetDate;
    expirationDate: BoatnetDate;
}

