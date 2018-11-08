import { Permit } from './permit';
import { Vessel } from './vessel';
import { Trip } from './trip';
 
// Track global application state.
// Generally, we should be pulling data from the PouchDB,
// but this is intended to be stored in localStorage.
export class AppState {
  name: string;
  permit: Permit;
  vessel: Vessel;
  trip: Trip;

  public constructor(init?: Partial<AppState>) {
    Object.assign(this, init);
  }
}
