import { BoatnetDate } from '../_common';
import { Base } from '../_base';

export type BrdType = string;

export const BrdTargetTypeName = 'brd-target-type';

declare type BrdColor = string; // TODO lookup
declare type BrdPattern = string; // TODO lookup
declare type BrdManufacturer = string; // TODO lookup
declare type BrdLocation = string; // TODO lookup
declare type BrdMeshType = string; // TODO lookup

export interface BrdLight {
  targets?: BrdTarget[];
  // TODO: Ryan to review rigging #'s
  numLightsSingleRigged?: number;
  numLightsDoubleRiggedPort?: number;
  numLightsDoubleRiggedStarboard?: number;

  colors?: BrdColor[]; // Usually Green
  pattern?: BrdPattern[];
  manufacturer?: BrdManufacturer[];
  location?: BrdLocation[];
}

export interface BrdEscapement {
  targets?: BrdTarget[];
  location?: BrdLocation[];
  isIlluminated?: boolean;
}

export interface BrdSortingGrateGrid {
  targets?: BrdTarget[];
  location?: BrdLocation[];
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
  location?: string[];
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
