import { BoatnetUser } from '@boatnet/bn-auth';
import { BoatnetDate, WcgopTrip, Base, Port, Vessel, EmEfp, OTSTarget, OTSTrip, OTSUser, Permit, Person } from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}

export interface DebrieferState {
  program: string;
  cruiseIds: string;
  observers: string;
  evaluationPeriod: any;
  tripIds: string[];
  operationIds: string[];
  catches: string[];
}

export interface TripState {
  activeTrip: WcgopTrip | null;
  trips: WcgopTrip[];
  newTrip?: boolean;
  readOnly?: boolean;
  index?: any;
}

export interface PermitState {
  activePermit: Permit | null;
  permits: Permit[];
  vesselPermits?: any;
  filterText: string;
}

export interface EmefpState {
  activeEmefp?: any;
  newEmEfp?: boolean;
  filterText: string;
}

export interface UserState {
  activeUser?: Person;
  activeUserAlias?: any;
  users: Person[];
  newUser: boolean;
  unLinkedApexUsers: any[];
  captainMode: boolean;
  closedTripsTable: boolean;
}

export interface VesselState {
  activeVessel?: any;
  filterText: string;
}

export interface OTSState {
  activeOTSTarget: any | null;
  newTarget: boolean;
}

export interface ObserverAssignmentState {
  activeTrip: any | null;
}

export interface ObserverAvailabilityState {
  activeActivity: any | null;
  isNewActivity: any | null;
}

export interface GeneralState {
  portDecoder: any[];
  appVersion: string;
  // ports: string[];
  // fisheries: string[];
  // targetTypes: string[];
  // roles: string[];
  // usStates: string[];
  // portGroups: string[];
  // otsTargets: OTSTarget[];
  // vessels: Vessel[];
  // notificationOptions: any[];
  // activeTarget: OTSTarget;
}

export interface BreadcrumbNavigation {
  // TODO - figure out how to store our locations
  currentRouterLocation?: string;
  prevRouterLocation?: any;
}

export interface WcgopAppState {
  currentNavigation?: BreadcrumbNavigation;
  currentTrip?: WcgopTrip;
  isKeyboardEnabled?: boolean;
}
