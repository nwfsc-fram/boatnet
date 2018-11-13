import { BoatnetBase } from './interface/boatnet-base';

export class Trip implements BoatnetBase {
  id: string;
  type: 'trip';
  created_by: string;
  created_date: BoatnetDate;
  vessel: string;
  permit: string;
  start_date: string;
  end_date: string;
  status: string;
  selected: string;
  messages: string;
  trip_num: string;
  uscg_num: string;
  state_reg: string;
}
