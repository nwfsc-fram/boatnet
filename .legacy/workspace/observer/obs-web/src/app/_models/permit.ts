import { BoatnetBase } from './interface/boatnet-base';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '../shared/util';

export class Permit {
  // id: string;
  // type: 'permit';
  // created_by: string;
  // created_date: BoatnetDate;

  permit_number: string;
  certificate_start_date: BoatnetDate;
  certificate_end_date: BoatnetDate;
  permit_owner: string;
  permit_owner_address: string;
  permit_owner_city: string;
  permit_owner_state: string;
  permit_owner_zip: number;
  vessel_name: string;
  vessel_length: number;
  vessel_registration_number: string;
  vessel_owner: string;
  vessel_owner_address: string;
  vessel_owner_city: string;
  vessel_owner_state: string;
  vessel_owner_zip: number;
  trawl_gear: Boolean;
  longline_gear: Boolean;
  trap_pot_gear: Boolean;
  small_fleet: Boolean;
  endorsed_length: number;
  sablefish_endorsement: Boolean;
  sablefish_tier: number;
  cp_endorsement: Boolean;
  ms_endorsement: Boolean;
  mothership_catcher_vessel: Boolean;
  whiting_percent: string;
  whiting_assignment: string;
  status: string;
  goid: number;
  ghid: number;
  owner_on_board_exempt: Boolean;


// public constructor(init?: Partial<Permit>) {
//   Object.assign(this, init);
// }

// static createPermit() {
//   return new Permit({
//     id: uuid(),
//     type: 'permit',
//     created_by: "seth gerou",
//     created_date: getBoatnetDateNow(),
//     permit_num: null,
//     vessel: null,
//     vessel_registration_number: null,
//     fishery: "EM EFP",
//     certificate_start_date: getBoatnetDateNow(),
//     certificate_end_date: "12/31/2018"
//   })

// }

}