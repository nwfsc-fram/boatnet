import { BoatnetBase } from '../interface/boatnet-base';
import { Species } from '../shared/species';

export class Catch implements BoatnetBase {
  id: string;
  type: 'catch';
  created_by: string;
  created_date: BoatnetDate;
  species: Species[];
}
