import { Permit } from './permit';
import { Vessel } from './vessel';
import { Trip } from './trip';
import { User } from './user';
import { Message } from './message';
 
// Track global application state.
// Generally, we should be pulling data from the PouchDB,
// but this is intended to be stored in localStorage.
export class AppState {
  name: string;
  permit: Permit;
  vessel: Vessel;
  trip: Trip;
  user: User;
  message: Message;

  public constructor(init?: Partial<AppState>) {
    Object.assign(this, init);
  }
}
