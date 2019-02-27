import { BoatnetBase } from './interface/boatnet-base';

export class OtsTarget implements BoatnetBase {
  id: string;
  type: 'ots-target';
  created_by: string;
  created_date: BoatnetDate;
  coverage_type: string;
  coverage_target: string;
  rate: string;
  start_date: BoatnetDate;
  end_date: BoatnetDate;
}
