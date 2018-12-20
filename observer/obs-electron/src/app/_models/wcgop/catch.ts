import { BoatnetBase, BoatnetDate } from 'bn-models';
import { Species } from 'bn-models';

export class Catch implements BoatnetBase {
  id: string;
  type: 'catch';
  created_by: string;
  created_date: BoatnetDate;
  species: Species[];
}
