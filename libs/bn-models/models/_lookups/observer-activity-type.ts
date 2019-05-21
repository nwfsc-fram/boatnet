import { Base } from '../_base';
import { Person } from '../_lookups';

export const ObserverActivityTypeTypeName = 'observer-activity-type';

export interface ObserverActivityType extends Base {
  description?: string;
  lookupVal?: number;
  observer?: Person;
}

