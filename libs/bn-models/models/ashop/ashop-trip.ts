// A-SHOP Trip
import { BaseTrip } from '../_base/base-trip';
import {
  Program,
  Fishery,
  FirstReceiver,
  TripStatus,
  LogbookType,
  Contact,
  Certificate,
  Waiver,
  GearType,
  CouchID,
  BoatnetDate,
  Port,
  VesselType
} from '../_common/index';

import {
  AshopSightingEvent,
  AshopBrd,
} from './index';

export const AshopTripTypeName = 'ashop-trip';

// unique A-SHOP Observer/ Debriefer
declare type AshopContact = Contact;

export interface AshopTrip extends BaseTrip {
  tripNum?: number; // by Vessel sequence
  observers?: {
    observer?: AshopContact;
    startDate?: BoatnetDate;
    endDate?: BoatnetDate;
  }[];
  fishingDays?: number; // calculated
  fishery?: Fishery; // default to A-SHOP
  crewSize?: number;
  didFishingOccur?: boolean;

  sightingEvents?: AshopSightingEvent[];

  brd?: AshopBrd[];
  // TODO Possibly reuse WcgopBrd, include Bird Detternce

  vesselType?: VesselType;
  legacy?: {
    tripSeq?: number;
    cruiseVesselSeq?: number;
    portCode?: number;
    fishingTimeLostHours?: {
      hours?: number;
      code?: string;
    }[];
  };
}
