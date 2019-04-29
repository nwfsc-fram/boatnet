import { Base } from '../_base';
import { CouchID } from '../_common';
import { GearType } from '.';
import { Vessel } from '.';
import { EfpType } from '.';

export interface EmEfp extends Base {
  emEfpNumber: string;
  efpTypes?: EfpType[];
  gear?: GearType[];
  lePermit?: string;
  sector?: string;
  vesselId?: CouchID;
  vesselName?: string;
  vesselCGNumber?: string;
}
