import { BoatnetBase } from '../interface/boatnet-base';
import { CatchReceptacle } from './catch-receptacle';
import { SampleStation } from './sample-station';

/**
 * TODO: Rename to SpeciesComp?
 */
export class CatchSample implements BoatnetBase {
  id: string;
  type: 'catch_sample';
  created_by: string;
  created_date: BoatnetDate;
  sample_station: SampleStation;
  child_samples: CatchSample[];
  catch_receptacles: CatchReceptacle[];
}
