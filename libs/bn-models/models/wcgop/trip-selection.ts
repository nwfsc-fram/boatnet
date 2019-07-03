import { Base } from '../_base';
import { Fishery, Permit } from '../_lookups';
import { BoatnetDate, CouchID } from '../_common';
import { Vessel } from '../_lookups';

export interface TripSelection extends Base {
  vessel: Vessel;
  isSelected: boolean;
  fishery?: string;
  permits?: Permit[];
  isActive?: boolean;
  // notes
}
