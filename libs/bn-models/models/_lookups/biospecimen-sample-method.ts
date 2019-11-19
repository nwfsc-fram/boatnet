import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const BiosampleSampleMethodTypeName = 'biospecimen-sample-method';

export interface BiospecimenSampleMethod extends BaseLookup {
  // description

  legacy?: {
    lookupVal?: number;
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
