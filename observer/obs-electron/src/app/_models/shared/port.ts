import { BoatnetBase } from '../interface/boatnet-base';

export class Port implements BoatnetBase {
  id: string;
  type: 'port';
  created_by: string;
  created_date: BoatnetDate;
  comments: string;
  port_name: string;
}
