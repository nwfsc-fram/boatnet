import { Base } from '../_base';
import { Port } from './port';
import { BoatnetDate } from '../_common/boatnet-date';
import { CouchID } from '../_common';
import { Vessel } from './vessel';
import { Media } from './media';
import { Permit } from './permit';
import { UsState } from './us-state';

// TODO Full implementation
export const PersonTypeName = 'person';
export const VesselCaptainTypeName = 'vessel-captain';

// Existing roles:
// BOATNET_OBSERVER = Application
//  * observer, debriefer, captain, permit_owner, provider,
//    analyst, lab_analyst, data_steward, enforcement,
//    vessel_owner, program_manager, gear_technician, lead_observer,
//    logistical_admin, coordinator, trainer, reports_user, staff,
//    development_staff

// BOATNET_SURVEY = Application (TODO: Multiple applications on auth server)
//  * fpc, biologist, captain, crew, data_steward,
//    program_manager, permit_owner, lab_analyst,
//    reports_user (PACFIN etc), development_staff
//
// Roles used for DataStore access, App Screen access, Widget-level access (divs, etc.)

export interface EmergencyContact {
  contact?: Person;
  relationToObserver?: string; // Lookup value
}

export interface OrganizationDateRange {
  org: Organization;
  startDate?: BoatnetDate;
  endDate?: BoatnetDate;
}

declare type notificationPreferences = string;
export type Organization = Person;


export type PrimaryContactID = string; // = ApexUserAdminUserName

/*
ContactsDB, replcating from MasterDB that includes:
    first name
    last name
    ApexUserAdminUserName

*/

// Originally CONTACTS
export interface Person extends Base {
  // This is sensitive PII
  firstName?: string;
  lastName?: string;
  apexUserAdminUserName?: PrimaryContactID;
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
