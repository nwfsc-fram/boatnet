import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const BiostructureTypeTypeName = 'biostructure-type';

export interface BiostructureType extends BaseLookup {
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
