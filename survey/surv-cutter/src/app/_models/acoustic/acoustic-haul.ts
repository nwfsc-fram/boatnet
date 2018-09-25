import { v4 as uuid } from 'uuid';
import { Haul } from '../interface/haul';
const moment = require('moment');
export class AcousticHaul implements Haul {
  id: string;
  type: 'haul';

  status: string;
  haulNumber: string;
  haulType: string;
  gearType: string;

  startDate: BoatnetDate;
  endDate?: BoatnetDate;
  performance?: string;

  chiefScientist: string;
  wetlabLead?: string;
  biologist1?: string;
  biologist2?: string;

  createdBy: string;
  createdDate: BoatnetDate;
  modifiedBy?: string;
  modifiedDate?: BoatnetDate;

  public constructor(init?: Partial<AcousticHaul>) {
    Object.assign(this, init);
  }

  static createAcousticHaul(haulNumber: string, gearType: string, startDate: BoatnetDate,
    username: string, haulType: string) {
    return new AcousticHaul({
      id: uuid(),
      type: 'haul',
      status: 'active',
      haulType: haulType,
      haulNumber: haulNumber,
      gearType: gearType,
      startDate: startDate,
      createdBy: username,
      createdDate: moment().format()
    });
  }
}
