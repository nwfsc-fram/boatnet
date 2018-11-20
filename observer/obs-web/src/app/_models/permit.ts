import { BoatnetBase } from './interface/boatnet-base';

export class Permit implements BoatnetBase {
  id: string;
  type: 'permit';
  created_by: string;
  created_date: BoatnetDate;
  vessel_name: string;
  uscg_num: string;
  state_reg: string;
  fishery: string;
  active_date: BoatnetDate;
  expiration_date: BoatnetDate;
}
