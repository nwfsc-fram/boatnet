import { v4 as uuid } from 'uuid';
const moment = require('moment');
import { WcgopCatchConfig } from './wcgop-catch';

export const WcgopAppConfig = {
  category: 'observer',
  program: 'WCGOP',
  catchConfig: WcgopCatchConfig
};

export class WcgopAppConfig2 {
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
  catchConfig = WcgopCatchConfig;

  /**
   * constructor
  init?: Partial<WcgopAppConfig>   */
  public constructor(init?: Partial<WcgopAppConfig2>) {
    Object.assign(this, init);
  }
  static createWcgopAppState() {
    return new WcgopAppConfig2({
      id: uuid()
    });
  }

}
