import { BaseLookup } from '../_base';

export interface BirdBand extends BaseLookup {
  whichLeg?: string;
  material?: string;
  colors?: string[];
  id?: string;
}
