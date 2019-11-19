import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const ContactTypeTypeName = 'contact-type';

export interface ContactType extends BaseLookup {
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
