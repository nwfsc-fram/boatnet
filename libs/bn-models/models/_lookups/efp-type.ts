import { Base } from '../_base';

export const EfpTypeTypeName = 'efp-type';

export interface EfpType extends Base {
  description?: string;
  lookupVal?: number;
}
