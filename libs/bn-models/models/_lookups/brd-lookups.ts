import { BoatnetDate } from '../_common';
import { Base } from '../_base';

export const BrdTargetTypeName = 'brd-target-type';

export type BrdColor = string; // TODO lookup
export type BrdPattern = string; // TODO lookup
export type BrdManufacturer = string; // TODO lookup
export type BrdLocation = string; // TODO lookup
export type BrdMeshType = string; // TODO lookup

// TODO maybe make generic types
// export type BrdComponentTypes = [
//   'light',
//   'escapement',
//   'sortingGrate',
//   'modifiedCodendMeshConfig',
//   'trawlDoorModConfig',
//   'otherConfig'
//   // ...
// ];

export interface BrdLight {
  targets?: BrdTarget[];
  // TODO: Ryan to review
  numLightsSingleRigged?: number;
  numLightsDoubleRiggedPort?: number;
  numLightsDoubleRiggedStarboard?: number;

  colors?: BrdColor[]; // Usually Green
  pattern?: BrdPattern[];
  manufacturer?: BrdManufacturer[]; // TODO remove? Legacy?
  locations?: BrdLocation[];
}

export interface BrdEscapement {
  targets?: BrdTarget[];
  locations?: BrdLocation[];
  isIlluminated?: boolean;
}

export interface BrdSortingGrateGrid {
  // TODO May be required to collect
  targets?: BrdTarget[];
  locations?: BrdLocation[];
  isIlluminated?: boolean;
}

export interface BrdModifiedCodendMesh {
  targets?: BrdTarget[];
  meshType?: BrdMeshType[];
}

export interface BrdTrawlDoorModification {
  targets?: BrdTarget[];
}

export interface BrdOther {
  targets?: BrdTarget[];
  locations?: BrdLocation[];
  comment?: string;
}

export interface BrdTarget extends Base {
  // From LOOKUPS
  value: string;
  // ETL Note: remove Alpha character
  // A: Salmon
  // B: Eulachon
  // C: PHLB
  // D: Rockfish
  // E: Flatfishes
  // F: Other

  legacy?: {
    description?: string;
    lookupVal?: string;
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
