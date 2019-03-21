import { Base } from '../_base/base';

export const PortTypeName = 'port';

// TODO add an at-sea transfer Port ID to DB
export interface Port extends Base {
  portId: string;
  name: string;
}
