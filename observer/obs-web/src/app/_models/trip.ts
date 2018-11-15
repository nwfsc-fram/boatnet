import { BoatnetBase } from './interface/boatnet-base';
import { Permit } from '../_models/permit';
import { Message } from '../_models/message';
 
export class Trip implements BoatnetBase {
  id: string;
  type: 'trip';
  created_by: string;
  created_date: BoatnetDate;
  vessel: string;
  permit: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  selected: boolean;
  messages: Message[];
  permits: Permit[];
  trip_num: string;
}
