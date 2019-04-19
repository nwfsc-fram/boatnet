import { Base } from '../_base';
import { CouchID } from '../_common';
import { GearType } from '../_lookups';
import { Vessel } from '../_lookups';
import { EfpType } from '../_lookups';

export interface EmEfpPermit extends Base {
  emEfpNumber: string;
  efpTypes?: EfpType[];
  gear?: GearType[];
  lePermit?: string;
  sector?: string;
  vesselId?: CouchID;
  vesselName?: string;
  vesselCGNumber?: string;
}
