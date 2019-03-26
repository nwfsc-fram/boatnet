// TODO Full implementation
import { Port } from './port';
import { Measurement } from './measurement';
import { Base } from '../_base';
import { BoatnetDate } from './boatnet-date';
import { VesselType } from './vessel-type';

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
