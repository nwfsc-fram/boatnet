// TODO Full implementation
import { Port } from './port';
import { Base } from '../_base';
import { VesselType } from './vessel-type';
import { BoatnetDate, Measurement, CouchID } from '../_common/index';
import { Person, VesselCaptain } from './person';
import { Media } from './media';
import { Permit } from '../_misc/permit';

export const VesselTypeName = 'vessel';

interface SafetyMeasure extends Base {
  safetyType: string; // - lookup - CPR, Wheel watch, Equipment, Emergency Instructions
  equipmentDescription: string;
  // lookup - liferaft, EPIRB, Flare, Fire Extinguisher, PFD Type 4, Decal
  count?: number;
  location?: string; //
  expirationDate?: BoatnetDate;
}

export interface Vessel extends Base {
  vesselName?: string;
  vesselType?: VesselType;
  port?: Port;
  coastGuardNumber?: string;
  stateRegulationNumber?: string;
  registeredLength?: Measurement;
  vesselStatus?: string; // lookup value - Active, Inactive, Retired, Sank, Byback
  captains?: VesselCaptain[];
  safetyMeasures?: SafetyMeasure[]; // 30+ items
  media?: Media[];

  // TODO store crew at Vessel level?
  legacy?: {
    vesselId?: number;
    obsprodLoadDate?: BoatnetDate;
    safetyDecalExpiration?: BoatnetDate; // replace by the Safety Checklist
  };
}
