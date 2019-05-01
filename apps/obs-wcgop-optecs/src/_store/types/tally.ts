import { Base } from '@boatnet/bn-models';

export interface TallyButtonData {
  index: number; // screen location
  // Styling
  color?: string;
  'text-color'?: string;
  blank?: boolean;

  // Data
  code?: string;
  reason?: string;
  count?: number;
}

export const TallyRecordTypeName = 'tally-record';

export interface TallyRecord extends Base {
  buttonData: TallyButtonData[];
  vertButtonCount: number;
  horizButtonCount: number;
}

export interface TallyState {
  tallyRecord: TallyRecord;
}
