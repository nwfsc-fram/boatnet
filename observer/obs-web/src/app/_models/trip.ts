import { BoatnetBase } from './interface/boatnet-base';
import { Permit } from '../_models/permit';
import { Message } from '../_models/message';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '../shared/util';
 
export class Trip implements BoatnetBase {
  id: string;
  type: 'trip';
  created_by: string;
  created_date: BoatnetDate;
  vessel: string;
  permit: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  selected: boolean;
  messages: Message[];
  permits: Permit[];
  trip_num: string;

  public constructor(init?: Partial<Trip>) {
    Object.assign(this, init);
  }

  static createTrip() {
    return new Trip({
      id: uuid(),
      type: 'trip',
      created_by: 'seth gerou',
      created_date: getBoatnetDateNow(),
      selected: false,
      vessel: null,
      is_open: true,
      messages: [],
      permits: [],
    });
  }

}
