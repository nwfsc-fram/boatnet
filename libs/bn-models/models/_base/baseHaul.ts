import { Base } from './base';
import { Port, BoatnetDate } from '../_common/index';

// Base Haul Class, intended to be subclassed
export interface BaseHaul extends Base {
  startPort?: {
    // Starting Port
    port: Port;
    date: BoatnetDate;
  };
  endPort: {
    // Final Port
    port: Port;
    date: BoatnetDate;
  };
}
