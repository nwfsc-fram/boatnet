import { BoatnetBase } from '../interface/boatnet-base';

export class Location implements BoatnetBase {
  id: string;
  type: 'location';
  created_by: string;
  created_date: BoatnetDate;
  location_type: string;
  date_time: BoatnetDate;
  lat: string;
  lon: string;
  fishing_depth: string;
  bottom_depth: string;
}
