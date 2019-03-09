// Base Haul Class, intended to be subclassed
import { Base } from './base';
import { Port, BoatnetDate } from '../_common/index';

// TODO: What are other common fields for hauls?
export interface BaseHaul extends Base {
  haulNum?: number;
}
