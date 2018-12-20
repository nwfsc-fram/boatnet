import { BoatnetBase, BoatnetDate } from 'bn-models';

export class Event implements BoatnetBase {
  id: string;
  type: 'event';
  created_by: string;
  created_date: BoatnetDate;
  latitude_dd: number;
  longitude_dd: number;
  event_date: BoatnetDate;
  sequence_number: number;
  best_latitude_dd: number;
  best_longitude_dd: number;
}
