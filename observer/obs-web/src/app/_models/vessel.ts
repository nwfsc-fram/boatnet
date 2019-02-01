import { BoatnetBase } from './interface/boatnet-base';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '../shared/util';
import { stringify } from '@angular/core/src/util';
import { Permit } from '../_models/permit';

export class Vessel implements BoatnetBase {
  id: string;
  type: 'vessel';
  created_by: string;
  created_date: BoatnetDate;
  vessel_name: string;
  vessel_reg_num: string;
  permits: Permit[];
  coast_guard_number: string;
  state_reg_number: string;


  public constructor(init?: Partial<Vessel>) {
    Object.assign(this, init);
  }

  static createVessel() {
    return new Vessel({
      id: uuid(),
      type: 'vessel',
      created_by: 'seth gerou',
      created_date: getBoatnetDateNow(),
      vessel_name: null,
      vessel_reg_num: null,
      permits: [],
      coast_guard_number: null,
      state_reg_number: null
    });
  }

}
