import { BoatnetBase } from './boatnet-base';

export interface Haul extends BoatnetBase {
  type: 'haul';
  status: string;
  haulNumber: string;
  gearType: string;
  startDate: BoatnetDate;
  endDate?: BoatnetDate;
  performance?: string;
}
