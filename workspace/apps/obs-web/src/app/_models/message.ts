import { BoatnetBase } from './interface/boatnet-base';

export class Message implements BoatnetBase {
  id: string;
  type: 'message';
  created_by: string;
  created_date: BoatnetDate;
  content: string;
}
