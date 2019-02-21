import { BoatnetBase } from './interface/boatnet-base';
import { Permit } from '../_models/permit';
import { Message } from '../_models/message';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '../shared/util';
import { StateService } from '../_services/data/state.service';
 
export class Trip implements BoatnetBase {
  id: string;
  type: 'trip';
  trip_num: string;
  created_by: string;
  created_date: BoatnetDate;
  vessel: string;
  permit: string;
  start_date: string;
  start_port: string;
  end_date: string;
  end_port: string;
  is_open: boolean;
  selected: boolean;
  unlisted_permit: string;
  messages: Message[];
  permits: Permit[];

  public constructor(init?: Partial<Trip> ) {
    Object.assign(this, init);
  }

  static createTrip(home_port, vessel) {
    return new Trip({
      id: uuid(),
      type: 'trip',
      trip_num: '17',
      created_by: 'seth gerou',
      created_date: getBoatnetDateNow(),
      selected: false,
      vessel: vessel,
      is_open: true,
      unlisted_permit: null,
      messages: [],
      permits: [],
      start_port: home_port,
      end_port: "same as start",
    });
  }

}
