import { BaseLookup } from '../_base';
import { Port } from './port';

export const PortGroupTypeName = 'port-group';

export interface PortGroup extends BaseLookup {
    name: string;
    ports?: Port[];
}
