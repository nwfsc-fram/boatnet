import { v4 as uuid } from 'uuid';
import { BoatnetBase, BoatnetDate } from 'fram-models';
import { Species } from 'fram-models';
import { GearType } from 'fram-models';
import { Event } from './event';
import { CatchSample } from './catch-sample';
import { SampleStation } from './sample-station';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { getBoatnetDateNow } from '../../shared/util';

export class Haul implements BoatnetBase {
  id: string;
  type: 'haul';
  created_by: string;
  created_date: BoatnetDate;

  haul_type: string;
  haul_start: BoatnetDate;
  haul_end: BoatnetDate;
  haul_num: number;
  events: Event[];
  catch_samples: CatchSample[];
  sample_stations: SampleStation[];
  performance: string; // TODO Performance model?

  friendly_trip_id: number;
  wm: number;
  gear_perf: number;
  target_strategy: Species;
  gear_type: GearType;
  dates: {
    departure_date: BoatnetDate;
    return_date: BoatnetDate;
  }
  testing: {
    otc_wt: number;
    errors: number;
  }
  otc: number;

  start_date: BoatnetDate;
  end_date: BoatnetDate;

  observer_catch_estimate: number;
  vessel_catch_estimate: number;
  bio_list: number;
  haul_sampled: boolean;
  beaufort_scale: number;
  brd_present: boolean;
  seabird_avoidance: boolean;
  efp: boolean;
  total_hookspots_set: number;
  num_hookspots_lost: number;
  avg_soak_time: number;
  locations: Location[];
  vessel_type: number;
  delivery_vessel_id: number;
  sampled_by: number;
  tribal_code: number;
  percent_marine_mammal_monitored: number;
  sample_type: number;
  sample_design: string;
  sample_unit_type: number;
  estimated_discard_weight: number;
  shortwired: boolean;
  em_or_observer: number;
  haulback_bird_observation_code: number;

  public constructor(init?: Partial<Haul>) {
    Object.assign(this, init);
  }

  static createWCGOPHaul(username: string) {
    return new Haul({
      id: uuid(),
      type: 'haul',
      created_by: username,
      created_date: getBoatnetDateNow(),
      testing: {
        errors: 0,
        otc_wt: 0
       },
       haul_num: 5

    });
  }


}
