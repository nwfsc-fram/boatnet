// Base Haul Class, intended to be subclassed
import { Base } from './base';

// TODO: What are other common fields for hauls?
export interface BaseHaul extends Base {
  haulNum?: number;
}
