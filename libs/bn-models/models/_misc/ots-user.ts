import { Port } from '../_lookups/port';

export interface OTSUser {
    name: string;
    roles: string[];
    email: string;
    mobile: number;
    home: number;
    homeport: Port;
  }