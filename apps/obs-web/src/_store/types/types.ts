import { BoatnetUser } from '@boatnet/bn-auth';
import { BoatnetDate, WcgopTrip, Base, Port, Vessel } from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AuthState {
  status: {
    isLoggingIn?: boolean;
    isLoggedIn?: boolean;
  };
  user: BoatnetUser | null;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}

export interface TripState {
  activeTrip: OTSTrip | null;
  trips: OTSTrip[];
  newTrip: boolean;
}

export interface PermitState {
  activePermit: Permit | null;
  permits: Permit[];
}

export interface UserState {
  activeUser: OTSUser;
  users: OTSUser[];
  newUser: boolean;
}

export interface VesselState {
  activeVessel: Vessel;
}

export interface GeneralState {
  ports: string[];
  fisheries: string[];
  targetTypes: string[];
  roles: string[];
  usStates: string[];
  portGroups: string[];
  portDecoder: any[];
  otsTargets: OtsTarget[];
  vessels: Vessel[];
  notificationOptions: any[];
}

export interface Permit extends Base {
  permit_number: string;
  certificate_start_date?: BoatnetDate;
  certificate_end_date?: BoatnetDate;
  permit_owner?: string;
  permit_owner_address?: string;
  permit_owner_city?: string;
  permit_owner_state?: string;
  permit_owner_zip?: string;
  vessel_name?: string;
  vessel_length?: number;
  vessel_registration_number?: string;
  vessel_owner?: string;
  vessel_owner_address?: string;
  vessel_owner_city?: string;
  vessel_owner_state?: string;
  vessel_owner_zip?: string;
  trawl_gear?: string;
  longline_gear?: string;
  trap_pot_gear?: string;
  small_fleet?: string;
  endorsed_length?: number;
  sablefish_endorsement?: string;
  sablefish_tier?: any;
  cp_endorsement?: string;
  ms_endorsement?: string;
  mothership_catcher_vessel?: string;
  whiting_percent?: null;
  whiting_assignment?: null;
  status?: string;
  goid?: string;
  ghid?: string;
  owner_on_board_exempt?: any;
}

export interface OtsTarget {
  fishery: string;
  targetType: string;
  target: string;
  rate: number;
  startDate: BoatnetDate;
  endDate?: BoatnetDate;
}

export interface OTSMessage extends Base {
  author: BoatnetUser;
  text: string;
}

export interface OTSTrip extends WcgopTrip {
  isSelected: boolean;
  messages?: OTSMessage[];
  permits?: string[] ;
}

export interface OTSUser {
  name: string;
  roles: string[];
  email: string;
  mobile: number;
  home: number;
  homeport: Port;
}
