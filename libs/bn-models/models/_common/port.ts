import { Base } from '../_base/base';

export const PortTypeName = 'port';

export interface Port extends Base {
  portId: string;
  name: string;
}
