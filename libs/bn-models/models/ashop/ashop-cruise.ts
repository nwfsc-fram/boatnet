// A-SHOP Trip
import { Base } from '../_base';
import { AshopTrip } from './ashop-trip';
import { Person, Vessel } from '../_lookups/index';
import { CouchID } from '../_common/index';

export const AshopCruiseTypeName = 'ashop-cruise';

declare type AshopContact = Person;

export interface AshopCruise extends Base {
  cruiseNum?: string; // in addition to _id
  vessel?: Vessel;
  trips?: CouchID[]; // Trip/ Set UUID's
  debriefer?: AshopContact; // After cruise is done
}
