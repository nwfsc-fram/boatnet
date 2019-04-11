import { Base } from './base';

import {
  BoatnetDate,
  Person,
  CouchID
} from '../_common/index';
import { Vessel } from '../_lookups/vessel';
import { Port } from '../_lookups/port';

export interface BaseTrip extends Base {
  operationIDs?: CouchID[]; // Haul/ Set UUID's
  captain?: Person;
  vessel?: Vessel;
  crew?: Person[];
  // Do we want plannedDeparturePort?
  departureDate?: BoatnetDate;
  returnDate?: BoatnetDate;
  departurePort?: Port;
  returnPort?: Port;
  // Metadata
  isExpanded?: boolean;
  doExpand?: boolean; // should expand or not after manual calculation

}
