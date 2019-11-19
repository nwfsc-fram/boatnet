import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const MediaTypeName = 'confidence';

export interface Media extends BaseLookup {
  type?: string;
  barCode?: string;
  // description?: boolean;
  frames?: string;
}
