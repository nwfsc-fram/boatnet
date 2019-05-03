import { Base } from '@boatnet/bn-models';

export interface TallyButtonData {
  index: number; // screen location
  // Styling
  color?: string;
  'text-color'?: string;
  blank?: boolean;

  // Data
  code?: string; // e.g. SABL
  reason?: string; // e.g. PRED
  count?: number;
}

export const TallyRecordTypeName = 'tally-record';

export interface TallyRecord extends Base {
  recordName: string; // friendly name
  isTemplate?: boolean; // is a template for new catches?
  buttonData?: TallyButtonData[];
  vertButtonCount: number;
  horizButtonCount: number;
}

export interface TallyState {
  tallyRecord: TallyRecord;
}
