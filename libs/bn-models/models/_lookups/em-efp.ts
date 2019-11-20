import { BaseLookup } from '../_base';
import { CouchID } from '../_common';
import { GearType } from '.';
import { Vessel } from '.';
import { EfpType } from '.';

export const EmEfpTypeName = 'emefp';

export interface EmEfp extends BaseLookup {
  emEfpNumber: string;
  efpTypes?: EfpType[];
  gear?: GearType[];
  lePermit?: string;
  sector?: string;
  vesselId?: CouchID;
  vesselName?: string;
  vesselCGNumber?: string;
  vessel?: Vessel;
}

