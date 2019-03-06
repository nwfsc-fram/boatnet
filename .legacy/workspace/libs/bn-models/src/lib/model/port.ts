import { BoatnetBase } from '../interface/boatnet-base';
import { BoatnetDate } from '../types/boatnet-date';

export class Port implements BoatnetBase {
  id: string;
  type: 'port';
  created_by: string;
  created_date: BoatnetDate;
  comments: string;
  port_name: string;
}
