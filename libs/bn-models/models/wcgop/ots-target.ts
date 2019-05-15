import { Base } from '../_base';
import { Fishery } from '../_lookups';
import { BoatnetDate, CouchID } from '../_common';
import { Vessel } from '../_lookups';

export const OTSTargetTypeName = 'ots-target';

export interface OTSTarget extends Base {
  fishery: string;
  targetType: string;
  targetVessel?: Vessel;
  targetPortGroup?: any;
  coverageGoal?: number;
  setRate?: number;
  effectiveDate?: BoatnetDate | undefined;
  expirationDate?: BoatnetDate | undefined;
}
