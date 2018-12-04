import { BoatnetBase } from '../interface/boatnet-base';
import { v4 as uuid } from 'uuid';
import { Vessel } from '../shared/vessel';
import { Port } from '../shared/port';
import { GearType, GEAR_TYPE_TRAWL } from '../shared/gear-type';
import { getBoatnetDateNow } from '../../shared/util';

export class Trip implements BoatnetBase {
  id: string;
  type: 'trip';
  created_by: string;
  created_date: BoatnetDate;

  gear_type: GearType;
  comments: string;

  friendly_trip_id: string;
  vessel: Vessel;
  fishery: string;
  skipper: string;
  num_crew: number;
  obs_logbook_num: number;
  licenses_permits: any[];
  ports: {
    departure_port: Port;
    return_port: Port;
  };
  dates: {
    departure_date: BoatnetDate;
    return_date: BoatnetDate;
  };
  partial_trip: boolean;
  fish_processed: boolean;
  fishing_days_num: number;
  vessel_logbook_name: string;
  vessel_logbook_page_num: number;
  first_receiver: string;
  fish_tickets: any[];

  public constructor(init?: Partial<Trip>) {
    // Allow passing anyvarious params to the constructor.
    Object.assign(this, init);
  }

  /**
   * Create Trip factory - create default WCGOP Trip
   * TODO: Return an aync promise instead
   */
  static createWCGOPTrip(username: string) {
    return new Trip({
      id: uuid(),
      type: 'trip',
      gear_type: GEAR_TYPE_TRAWL,
      created_by: username,
      created_date: getBoatnetDateNow(),
      vessel: new Vessel(),
      ports: {
        departure_port: new Port(),
        return_port: new Port()
      },
      dates: {
        departure_date: null,
        return_date: null
      },
      friendly_trip_id: 'sep 11 1234'
    });
  }
}
