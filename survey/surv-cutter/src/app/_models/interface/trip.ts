import { BoatnetBase } from './boatnet-base';
import { Vessel } from './vessel';

export interface Trip extends BoatnetBase {
  type: 'trip';
  vessel: Vessel;
  skipper: string;
  numCrew: number;

}
