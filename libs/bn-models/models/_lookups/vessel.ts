// TODO Full implementation
import { Port } from './port';
import { Base } from '../_base';
import { VesselType } from './vessel-type';
import { BoatnetDate, Measurement } from '../_common';

export const VesselTypeName = 'vessel';

export interface Vessel extends Base {
  vesselName?: string;
  vesselType?: VesselType;
  port?: Port;
  coastGuardNumber?: string;
  stateRegulationNumber?: string;
  registeredLength?: Measurement;
  safetyDecalExpiration?: Date;
  vesselStatus?: string; // lookup value

  legacy?: {
    vesselId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
