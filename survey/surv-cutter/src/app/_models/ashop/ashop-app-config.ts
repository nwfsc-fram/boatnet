import { v4 as uuid } from 'uuid';
const moment = require('moment');
import { AshopCatchConfig } from './ashop-catch';

export const AshopAppConfig = {
  category: 'observer',
  program: 'ASHOP',
  catchConfig: AshopCatchConfig
};

export class AshopAppConfig2 {
  id: string;
  category = 'observer';
  program = 'wcgop';
  // position: 1;
  // trip?: AcousticTrip;
  // haul?: AcousticHaul;
  // catch?: AcousticCatch;
  // specimen: any;
  // specialProject: any;

  tripConfig?: any;
  haulConfig: any;
  catchConfig = AshopCatchConfig;

  /**
   * constructor
  init?: Partial<WcgopAppConfig>   */
  public constructor(init?: Partial<AshopAppConfig2>) {
    Object.assign(this, init);
  }
  static createAshopAppState() {
    return new AshopAppConfig2({
      id: uuid()
    });
  }

}
