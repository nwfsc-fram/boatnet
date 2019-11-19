import { BaseLookup } from '../_base';
import { DeterrentType } from './deterrent-type';

export const DeterrentTypeName = 'deterrent';

export interface Deterrent extends BaseLookup {
  deterrenceType?: DeterrentType; // lookup value
  successful?: boolean;
  executionDescription?: string;
}
