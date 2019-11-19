import { BaseLookup } from '../_base';
import { Person } from '../_lookups';

export const ObserverActivityTypeTypeName = 'observer-activity-type';

export interface ObserverActivityType extends BaseLookup {
  // description?: string;
  // lookupValue?: number;
  observer?: Person;
}

