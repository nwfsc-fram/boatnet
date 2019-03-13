import { Base } from './base';

import {
  Port,
  BoatnetDate,
  Vessel,
  Contact,
  CouchID
} from '../_common/index';

// Base Trip Class, intended to be subclassed
// TODO: What are common fields of trip?
export interface BaseTrip extends Base {
  haulIDs?: CouchID[]; // Haul UUID's
  captain?: Contact;
  vessel?: Vessel;
  // Do we want plannedDeparturePort?
  departurePort?: Port;
  departureDate?: BoatnetDate;
  returnPort?: Port;
  returnDate?: BoatnetDate;
}
