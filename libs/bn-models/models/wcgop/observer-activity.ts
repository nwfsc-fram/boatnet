import { Base } from '../_base';
import { Fishery } from '../_lookups';
import { BoatnetDate, CouchID } from '../_common';
import { Vessel } from '../_lookups';
import { ObserverActivityType } from '../_lookups';

export const ObserverActivityTypeName = 'observer-activity';

export interface ObserverActivity extends Base {
  activityType?: ObserverActivityType;
  activityDescription?: string;
  startDate?: BoatnetDate | undefined;
  endDate?: BoatnetDate | undefined;
}
