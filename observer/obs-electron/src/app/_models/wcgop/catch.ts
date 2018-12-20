import { BoatnetBase, BoatnetDate } from 'fram-models';
import { Species } from 'fram-models';

export class Catch implements BoatnetBase {
  id: string;
  type: 'catch';
  created_by: string;
  created_date: BoatnetDate;
  species: Species[];
}
