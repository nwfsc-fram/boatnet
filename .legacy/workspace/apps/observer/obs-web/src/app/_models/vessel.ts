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
  ifq_port_code: string;
  ifq_port_id: number;
  is_mothership: string;
  notes: string;
  port_code: string;
  port_group: string;
  port_id: string;
  port_name: string;
  registered_length: number;
  registered_length_um: string;
  safety_decal_exp: string;
  state: string;
  vessel_orig_id: string;
  vessel_status: string;
  vessel_type: string;
  vessel_uuid: string;


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
      state_reg_number: null,
      ifq_port_code: null,
      ifq_port_id: null,
      is_mothership: null,
      notes: null,
      port_code: null,
      port_group: null,
      port_id: null,
      port_name: null,
      registered_length: null,
      registered_length_um: null,
      safety_decal_exp: null,
      state: null,
      vessel_orig_id: null,
      vessel_status: null,
      vessel_type: null,
      vessel_uuid: null,
    });
  }

}

