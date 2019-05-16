import { Base } from '@boatnet/bn-models';

export enum TallyButtonMode {
  MovingButton,
  TargetButton
}
export enum TallyOperationMode {
  Tally = 'TALLY_MODE',
  AddNamedSpeciesSelectSpecies = 'ADD_NAMED_SPECIES_SELECT_SPECIES',
  AddNamedSpeciesSelectType = 'ADD_NAMED_SPECIES_SELECT_TYPE',
  AddNamedSpeciesSelectLocation = 'ADD_NAMED_SPECIES_SELECT_LOCATION',
  DeleteButtonSelect = 'DELETE_BUTTON_SELECT',
  MoveButtonSelect = 'MOVE_BUTTON_SELECT',
  MoveSelectLocation = 'MOVE_SELECT_LOCATION',
  AddExistingSpeciesSelectSpecies = 'ADD_EXISTING_SPECIES_SELECT_SPECIES',
  AddExistingSpeciesSelectReason = 'ADD_EXISTING_SPECIES_SELECT_REASON',
  AddExistingSpeciesSelectLocation = 'ADD_EXISTING_SPECIES_SELECT_LOCATION',
  AddTempSpeciesReason = 'ADD_TEMP_SPECIES_REASON',
  AddTempSpeciesLocation = 'ADD_TEMP_SPECIES_LOCATION',
  NameTempSpeciesSelect = 'NAME_TEMP_SPECIES_SELECT',
  NameTempSpeciesSelectSpecies = 'NAME_TEMP_SPECIES_SELECT_FRESH_SPECIES',
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

  // Data
  labels?: {
    shortCode?: string; // e.g. SABL
    reason?: string; // e.g. PRED or RET(ained)
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
  currentButtonIdx?: number;
  currentReason?: string; // TODO Lookup type? PRED, etc.
  tempSpeciesCounter?: number;
  lastClickedIndex?: number;
  lastClickedWasInc?: boolean; // true for Inc
}
