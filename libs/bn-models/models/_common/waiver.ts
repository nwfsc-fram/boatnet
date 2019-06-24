import { Base } from '../_base';
import { WaiverType, Fishery, Port, Vessel, Permit, Media } from '../_lookups';
import { BoatnetDate } from './boatnet-date';

declare type WaiverReason = string; // TODO Lookup

export const WaiverTypeName = 'waiver';

export interface Waiver extends Base {
  reason: WaiverReason;
  waiverType: WaiverType;
  issueDate: BoatnetDate;
  startDate: BoatnetDate;
  endDate: BoatnetDate;
  vessel: Vessel; // you're always waiving a vessel
  fishery?: Fishery;
  certificateNumber?: Permit;
  landingPort?: Port;
  media?: Media[];

  // ETL Instructions
  // Select * from OBSPROD.LOOKUPS.LOOKUP_TYPE = 'WAIVER_REASON'
  //    nuke Not Active + Carry Over
}
