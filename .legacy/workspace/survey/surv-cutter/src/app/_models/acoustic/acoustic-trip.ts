import { Trip } from '../interface/trip';
import { Vessel } from '../interface/vessel';

export class AcousticTrip implements Trip {
  id: string;
  type: 'trip';

  vessel: Vessel;
  skipper: string;
  numCrew: number;
  comments: string;

  cols: ['vessel', 'startDate', 'endDate'];

  createdBy: string;
  createdDate: BoatnetDate;
  modifiedBy?: string;
  modifiedDate?: BoatnetDate;

  public constructor(init?: Partial<AcousticTrip>) {
    Object.assign(this, init);
  }
}
