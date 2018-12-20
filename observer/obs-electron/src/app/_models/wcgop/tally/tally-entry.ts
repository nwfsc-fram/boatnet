import { BoatnetBase, BoatnetDate } from 'fram-models';
import { TallyDataEntry } from './tally-data-entry';

export class TallyData implements BoatnetBase {
  id: string;
  type: 'tally';
  created_by: string;
  created_date: BoatnetDate;
  tallyData: TallyDataEntry[];
}
