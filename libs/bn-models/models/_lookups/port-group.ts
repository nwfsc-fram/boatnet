import { Base } from '../_base';
import { Port } from './port';

export const PortGroupTypeName = 'port-group';

export interface PortGroup extends Base {
    name: string;
    ports?: Port[];
}
