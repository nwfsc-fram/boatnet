// Unique fields of WCGOP trips
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
  BoatnetDate
} from '../_common/index';

import { WcgopSightingEvent, WcgopFishTicket } from './index';
import { WcgopBrd } from './wcgop-brd';
import { WcgopHlfc } from './wcgop-hlfc';

export const WcgopTripTypeName = 'wcgop-trip';

export interface WcgopTrip extends BaseTrip {
  tripNum?: number; // For optecs internal use, sequential
  observer?: Contact; // formerly User ID, TODO Specifics
  program?: Program;
  isPartialTrip?: boolean;
  fishingDays?: number;
  fishery?: Fishery;
  crewSize?: number;
  firstReceivers?: FirstReceiver[]; // FR lookups are in Permits DB
  logbookNum?: number;
  logbookType?: LogbookType;
  observerLogbookNum?: number;
  isFishProcessed?: boolean;
  tripStatus?: TripStatus;
  debriefer?: Contact;

  sightingEvents?: WcgopSightingEvent[];
  brd?: WcgopBrd[];
  hlfc?: WcgopHlfc[];

  fishTickets?: WcgopFishTicket[];
  certificates?: Certificate[]; // Permits and Licenses
  waiver?: Waiver;
  intendedGearType?: GearType; // only for when there is no Haul data (no fishing activity)
  legacy?: {
    tripId?: number;
    otcKp?: number;
    totalHooksKp?: number;
    export?: number; // status of expansion, ETL to isExpanded
    runTer?: boolean;
    evaluationId?: number; // TODO Evaluation parent
    permitNum?: string; // ETL to Certificate
    licenseNum?: string; // ETL to Certificate
    isNoFishingActivity?: boolean; // did fishing NOT occur?

    obsprodLoadDate?: BoatnetDate;
  };
}
