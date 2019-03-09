import { Base } from './base';

import {
  Port,
  BoatnetDate,
  Vessel,
  Program,
  Contact,
  Fishery,
  FirstReceiver,
  TripStatus
} from '../_common/index';

// Base Trip Class, intended to be subclassed
// TODO: What are common fields of trip?
export interface BaseTrip extends Base {
  haulIDs?: string[]; // Haul ID's

  vessel?: Vessel;
  // user: same as createdBy?
  program?: Program;
  departurePort?: Port;
  departureDate?: BoatnetDate;
  returnPort?: Port;
  returnDate?: BoatnetDate;
  skipper?: Contact;
  partialTrip?: boolean;
  fishingDays?: number;
  fishery?: Fishery;
  crewSize?: number;
  firstReceiver?: FirstReceiver;
  fishProcessed?: boolean;
  tripStatus?: TripStatus;
  // debriefing?
  // evaluation?
}
