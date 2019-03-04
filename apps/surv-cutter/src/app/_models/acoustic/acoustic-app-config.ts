import { v4 as uuid } from 'uuid';
const moment = require('moment');
import { AcousticTrip } from './acoustic-trip';
import { AcousticHaul } from './acoustic-haul';
import { AcousticCatch, AcousticCatchConfig } from './acoustic-catch';

export const AcousticAppConfig = {
  category: 'survey',
  program: 'hake',
  // tripConfig: AcousticTripConfig,
  // haulConfig: AcousticHaulConfig,
  catchConfig: AcousticCatchConfig
  // specimenConfig: AcousticSpecimenConfig,
};

export class AcousticAppConfig2 {
  id: string;
  category = 'survey';
  program = 'hake';
  // position: 1;
  trip?: AcousticTrip;
  haul?: AcousticHaul;
  catch?: AcousticCatch;
  // specimen: any;
  // specialProject: any;

  tripConfig?: any;
  haulConfig: any;
  catchConfig = AcousticCatchConfig;

  /**
   * constructor
  init?: Partial<AcousticAppConfig>   */
  public constructor(init?: Partial<AcousticAppConfig2>) {
    Object.assign(this, init);
  }
  static createAcousticAppState() {
    return new AcousticAppConfig2({
      id: uuid()
    });
  }
}
