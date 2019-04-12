// TODO Full implementation
import { Port } from './port';
import { Base } from '../_base';
import { VesselType } from './vessel-type';
import { BoatnetDate, Measurement } from '../_common/index';
import { Person } from './person';

export const VesselTypeName = 'vessel';

interface VesselCaptain {
  // Current contact info
  person: Person[];
  contactType: string; // Captain, etc
  isActive?: boolean;
}

export interface Vessel extends Base {
  vesselName?: string;
  vesselType?: VesselType;
  port?: Port;
  coastGuardNumber?: string;
  stateRegulationNumber?: string;
  registeredLength?: Measurement;
  safetyDecalExpiration?: Date;
  vesselStatus?: string; // lookup value
  captains?: VesselCaptain[];
  // TODO store crew at Vessel level?
  legacy?: {
    vesselId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
