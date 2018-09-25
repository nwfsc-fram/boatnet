import { BoatnetBase } from '../interface/boatnet-base';

export class Personnel implements BoatnetBase {
  id: string;
  type: 'personnel';
  created_by: string;
  created_date: BoatnetDate;
  organization: string;
  crew_role: string;
}
