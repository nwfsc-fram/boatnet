import { BoatnetBase } from './interface/boatnet-base';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '../shared/util';
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
  phone: string;
  role: string;
  vessel: string;

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
      phone: null,
      role: null,
      vessel: null
    });
  }

}
