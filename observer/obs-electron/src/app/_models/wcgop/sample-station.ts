import { BoatnetBase, BoatnetDate } from 'bn-models';

import { Personnel } from 'bn-models';

export class SampleStation implements BoatnetBase {
  id: string;
  type: 'sample_station';
  created_by: string;
  created_date: BoatnetDate;
  personnel: Personnel;
  display_name: string;
  sinker_weight_kg?: number;
  performance: string; // TODO Performance model?
  location: {
    latitude_dd: number;
    longitude_dd: number;
    // TODO Complex polygons etc
  };
}
