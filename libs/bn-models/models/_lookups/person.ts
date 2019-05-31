import { Base } from '../_base';
import { Port } from './port';
import { BoatnetDate } from '../_common/boatnet-date';
import { CouchID } from '../_common';
import { Vessel } from './vessel';
import { Media } from './media';
import { Permit } from '../_misc/permit';

// TODO Full implementation
export const PersonTypeName = 'person';
export const VesselCaptainTypeName = 'vessel-captain';

// Existing roles:
// OBSERVER = Application
//  * observer, debriefer, captain, permit owner, provider,
//    analyst, lab analyst, data steward, enforcement,
//    vessel owner, program manager, gear technician, lead observer,
//    logistical admin, coordinator, trainer, reports user, staff,
//    development staff

// SURVEY = Application
//  * FPC, biologist, captain, crew, data steward,
//    program manager, permit owner, lab analyst,
//    reports user (PACFIN etc), development staff
//
// Roles used for DataStore access, App Screen access, Widget-level access (divs, etc.)

interface EmergencyContact {
  contact?: Person;
  relationToObserver?: string; // Lookup value
}

interface OrganizationDateRange {
  org: Organization;
  startDate?: BoatnetDate;
  endDate?: BoatnetDate;
}

declare type notificationPreferences = string;
export type Organization = Person;

// Originally CONTACTS
export interface Person extends Base {
  // This is sensitive PII
  firstName?: string;
  lastName?: string;
  apexUserAdminUserName?: string;
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
  homeEmail?: string[];
  birthdate?: BoatnetDate;
  emergencyContacts?: EmergencyContact[];
  organizations?: OrganizationDateRange[];
  plbNum?: string;
  epirbNum?: string[]; // NOAA database that keeps track of these, perhaps
  // we can query these
  // Populate via OBSLOG (epirbNum1 / epirbNum2)
  port?: Port;
  notificationPreferences?: notificationPreferences[];
  media?: Media[];
  // added to person from VesselCaptain as we don't know whether a person is a captain when the person is created.
  isActive?: boolean;
  activeVessel?: Vessel;

  legacy?: {
    PersonId?: number;
    userId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}

export interface VesselCaptain extends Person {
  isCaptainActive?: boolean;
  activeVessel?: Vessel;
  license?: string; // alphanumeric - goal in 2020 to remove this
}
