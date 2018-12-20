import { BoatnetBase, BoatnetDate } from 'bn-models';

export class CatchReceptacle implements BoatnetBase {
  id: string;
  type: 'catch_receptacle';
  created_by: string;
  created_date: BoatnetDate;
  weight_kg: number;
  count: number;
  sequence_number: number;
  is_subsample: boolean;
  is_fishing_related: boolean;
  is_military_related: boolean;
  is_weight_estimated: boolean;
  is_partial: boolean;
}
