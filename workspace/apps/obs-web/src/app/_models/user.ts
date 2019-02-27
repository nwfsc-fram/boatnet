import { BoatnetBase } from './interface/boatnet-base';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '@boatnet/bn-models';
import { Vessel } from './vessel';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';

export class User implements BoatnetBase {
  id: string;
  type: 'user';
  created_by: string;
  created_date: BoatnetDate;
  first_name: string;
  last_name: string;
  email: string;
  home: string;
  role: string;
  vessel: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  home_port: string;
  notification_prefs: string[];
  token: string; // For authentication via JWT
  username: string;
  password: string;
  pwexpiry: string;
  firstName: string;
  lastName: string;
  roles: any[];
  programs: any[];

  public constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  static createUser() {
    return new User({
      id: uuid(),
      type: 'user',
      created_by: 'seth gerou',
      created_date: getBoatnetDateNow(),
      first_name: null,
      last_name: null,
      email: null,
      home: null,
      role: null,
      vessel: null,
      mobile: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      home_port: null,
      notification_prefs: []
    });
  }
}
