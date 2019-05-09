import { Base } from '@boatnet/bn-models';

export enum TallyButtonMode {
  MovingButton,
  TargetButton
}
export enum TallyOperationMode {
  Tally = 'Tally Mode',
  AddNamedSpeciesSelectSpecies = 'Select Species',
  AddNamedSpeciesSelectType = 'Select Type',
  AddNamedSpeciesSelectLocation = 'Select Location',
  Unknown = 'Unknown'
}

export interface TallyButtonData {
  index: number; // screen location
  // Styling
  color?: string;
  'text-color'?: string;
  blank?: boolean;
  tempState?: TallyButtonMode;

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
  incDecValue?: number; // +1 or -1

  // State Machine
  operationMode?: TallyOperationMode;

}
