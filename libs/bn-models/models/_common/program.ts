import { Base } from '../_base';
import { BoatnetDate } from './boatnet-date';

export const ProgramTypeName = 'program';

export interface Program extends Base {
  name?: string;
  description?: string;

  legacy?: {
    programId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
