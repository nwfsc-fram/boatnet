// A-SHOP Trip
import { Base } from '../_base';
import { AshopTrip } from './ashop-trip';
import { Vessel, Contact, BoatnetDate } from '../_common';

export const AshopCruiseTypeName = 'ashop-cruise';

declare type AshopContact = Contact;

export interface AshopCruise extends Base {
  cruiseNum?: string; // in addition to _id
  vessel?: Vessel;
  trips?: AshopTrip[];
  debriefer?: AshopContact; // After cruise is done
}
