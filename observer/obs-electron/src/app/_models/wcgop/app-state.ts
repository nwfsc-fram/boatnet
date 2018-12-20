import { Program } from 'fram-models';
import { GearType } from 'fram-models';
import { Species } from 'fram-models';
import { Trip } from './trip';
import { Haul } from './haul';
import { Catch } from './catch';

// Track global application state.
// Generally, we should be pulling data from the PouchDB,
// but this is intended to be stored in localStorage.
export class AppState {
  name: string;
  trip: Trip;
  haul: Haul;
  catch: Catch;
  species: Species;
  program: Program;
  gearType: GearType;

  public constructor(init?: Partial<AppState>) {
    Object.assign(this, init);
  }
}
