import { BoatnetBase, BoatnetDate } from '@boatnet/bn-models';
import { Species } from '@boatnet/bn-models';

export class Catch implements BoatnetBase {
  id: string;
  type: 'catch';
  created_by: string;
  created_date: BoatnetDate;
  species: Species[];
}
