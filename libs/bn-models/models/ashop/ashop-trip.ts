// A-SHOP Trip
import { BaseTrip } from '../_base/base-trip';
import { BoatnetDate, SightingEvent, InteractionEvent } from '../_common/index';

import { AshopBrd } from './index';
import { Person, Fishery, VesselType } from '../_lookups/index';

export const AshopTripTypeName = 'ashop-trip';

// unique A-SHOP Observer/ Debriefer
declare type AshopContact = Person;

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

  sightingEvents?: SightingEvent[];
  ineractionEvents?: InteractionEvent[]; //todo

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
