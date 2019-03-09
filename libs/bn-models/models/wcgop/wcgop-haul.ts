import { BaseHaul } from '../_base/baseHaul';

export interface WCGOPHaul extends BaseHaul {
  type: string;
  gearType: string; // Trawl or Fixed Gear
}
