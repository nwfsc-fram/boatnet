import { Base } from '@boatnet/bn-models';

export enum TallyButtonMode {
  MovingButton,
  TargetButton
}
export enum TallyOperationMode {
  Tally = 'TALLY_MODE',
  AddNamedSpeciesSelectSpecies = 'ADD_NAMED_SPECIES_SELECT_SPECIES',
  AddNamedSpeciesSelectType = 'SELECT_TYPE',
  AddNamedSpeciesSelectLocation = 'SELECT_LOCATION',
  Unknown = 'Unknown'
}

// -- Layout Related Interfaces --
export interface TallyButtonLayoutData {
  // Pure code and reason layout info. No count data
  index: number; // screen location
  // Styling
  color?: string;
  'text-color'?: string;
  blank?: boolean;
  tempState?: TallyButtonMode;

  // Data
  labels?: {
    shortCode?: string; // e.g. SABL
    reason?: string; // e.g. PRED or RET(ained)
    countTmp?: number; // TODO REMOVE!!!!!
  };
}

export const TallyLayoutRecordTypeName = 'tally-layout';

export interface TallyLayoutRecord extends Base {
  recordName: string; // friendly name
  isTemplate?: boolean; // is a template for new catches?
  layoutData: TallyButtonLayoutData[];
  vertButtonCount: number;
  horizButtonCount: number;
}

// -- Data Related Interfaces --
export const TallyDataRecordTypeName = 'tally-data';

export interface TallyCountData extends Base {
  species?: any; // TODO actual Species data
  shortCode?: string; // TODO redundant with species, refactor
  reason?: string;
  count?: number;
}

export interface TallyDataRecord extends Base {
  data?: TallyCountData[];
}

// -- TallyState Interface --
export interface TallyState {
  tallyLayout: TallyLayoutRecord;
  tallyDataRec?: TallyDataRecord;

  // State
  incDecValue?: number; // +1 or -1
  operationMode?: TallyOperationMode;
}
