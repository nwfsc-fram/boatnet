import { Base } from './base';

import {
  Port,
  BoatnetDate,
  Vessel,
  Contact,
  CouchID
} from '../_common/index';

export interface BaseTrip extends Base {
  operationIDs?: CouchID[]; // Haul/ Set UUID's
  captain?: Contact;
  vessel?: Vessel;
  // Do we want plannedDeparturePort?
  departurePort?: Port;
  departureDate?: BoatnetDate;
  returnPort?: Port;
  returnDate?: BoatnetDate;
  // Metadata
  isExpanded?: boolean;
  doExpand?: boolean; // should expand or not after manual calculation

}
