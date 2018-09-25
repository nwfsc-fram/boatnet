import { BoatnetBase } from '../interface/boatnet-base';

export class Species implements BoatnetBase {
  id: string;
  type: 'species';
  created_by: string;
  created_date: BoatnetDate;
  speciesID: number;
  speciesUUID: string;
  active: boolean;
  commonName: string;
  pacfinCode: string;
  scientificName: string;
  speciesCode: number;
}
