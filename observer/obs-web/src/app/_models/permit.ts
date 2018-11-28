import { BoatnetBase } from './interface/boatnet-base';

export class Permit implements BoatnetBase {
  id: string;
  type: 'permit';
  created_by: string;
  created_date: BoatnetDate;
  vessel: string;
  vessel_registration_number: string;
  fishery: string;
  certificate_start_date: BoatnetDate;
  certificate_end_date: BoatnetDate;
  endorsed_length: number;
}
