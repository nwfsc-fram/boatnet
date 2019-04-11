import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const MediaTypeName = 'confidence';

export interface Media {
  type?: string;
  barCode?: string;
  description?: boolean;
  frames?: string;
}
