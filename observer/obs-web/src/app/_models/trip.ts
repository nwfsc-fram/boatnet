import { BoatnetBase } from './interface/boatnet-base';

export class Trip implements BoatnetBase {
  id: string;
  type: 'trip';
  created_by: string;
  created_date: BoatnetDate;
  vessel_name: string;
  uscg_num: string;
  state_reg: string;
}
