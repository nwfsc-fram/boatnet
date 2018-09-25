import { Trip } from './trip';
import { User } from '../shared/user';
import { Program } from '../shared/program';
import { GearType } from '../shared/gear-type';
import { Haul } from './haul';

// Track global application state.
// Generally, we should be pulling data from the PouchDB,
// but this is intended to be stored in localStorage.
export class AppState {
  name: string;
  trip: Trip;
  haul: Haul;
  program: Program;
  gearType: GearType;

  public constructor(init?: Partial<AppState>) {
    Object.assign(this, init);
  }
}
