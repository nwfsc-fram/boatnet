import { Base } from '../_base';
import { Port } from './port';
import { BoatnetDate } from '../_common/boatnet-date';
import { CouchID } from '../_common';

// TODO Full implementation
export const PersonTypeName = 'person';

declare type Organization = string; // TODO Lookup
declare type ApplicationRole = string; // TODO Lookup - match Apex User Admin
// Existing roles:
// OBSERVER
//  * observer, debriefer, captain, permit owner, provider,
//    analyst, lab analyst, data steward, enforcement,
//    vessel owner, program manager, gear technician, lead observer,
//    logistical admin, coordinator, trainer, reports user

// TRAWL
//  * FPC, biologist, captain, crew, data steward,
//    program manager, permit owner, lab analyst,
//    reports user (PACFIN etc)

// Originally CONTACTS
export interface Person extends Base {
  // This is sensitive PII
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  workPhone?: string; // Possible TODO: make custom phone number type for standardization purposes
  homePhone?: string;
  cellPhone?: string;
  workEmail?: string;
  homeEmail?: string;
  birthdate?: BoatnetDate;
  emergencyContacts?: {
    contact?: Person;
    relationToObserver?: string; // Lookup value
  }[];

  applicationRoles?: ApplicationRole[];

  organizations?: {
    org: Organization;
    startDate?: BoatnetDate;
    endDate?: BoatnetDate;
  }[];

  epirbIdNum?: string;
  epirbIdNum_2?: string; // Uncertain why there's a second one, legacy?
  epirbSerialNum?: number;
  portId?: Port;
  license?: string;

  legacy?: {
    PersonId?: number;
    userId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
