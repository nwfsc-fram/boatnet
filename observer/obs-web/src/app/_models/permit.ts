import { BoatnetBase } from './interface/boatnet-base';
import { v4 as uuid } from 'uuid';
import { getBoatnetDateNow } from '../shared/util';

export class Permit implements BoatnetBase {
  id: string;
  type: 'permit';
  created_by: string;
  created_date: BoatnetDate;
  permit_num: string;
  vessel: string;
  vessel_registration_number: string;
  fishery: string;
  certificate_start_date: BoatnetDate;
  certificate_end_date: BoatnetDate;
  endorsed_length: number;


public constructor(init?: Partial<Permit>) {
  Object.assign(this, init);
}

static createPermit() {
  return new Permit({
    id: uuid(),
    type: 'permit',
    created_by: "seth gerou",
    created_date: getBoatnetDateNow(),
    permit_num: null,
    vessel: null,
    vessel_registration_number: null,
    fishery: "EM EFP",
    certificate_start_date: getBoatnetDateNow(),
    certificate_end_date: "12/31/2018"
  })

}

}