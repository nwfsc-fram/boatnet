import { Base } from '../_base/index';
import { Taxonomy } from './taxonomy';

export const ProtocolTypeName = 'protocol';

export interface Protocol extends Base {
  taxonomy: Taxonomy;
}
