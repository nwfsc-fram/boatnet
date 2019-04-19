import { Base } from '../_base/base';
import { CouchID, BoatnetUser } from '.';
import {
  BrdLight,
  BrdEscapement,
  BrdSortingGrateGrid,
  BrdModifiedCodendMesh,
  BrdTrawlDoorModification,
  BrdOther,
  BrdLocation,
  BrdColor,
  BrdPattern,
  BrdTarget
} from '../_lookups/brd-lookups';
import { Species } from '../_lookups';

export const BrdConfigurationTypeName = 'brd-configuration';

declare type BrdEquipmentType = string;
// e.g. Modified Codend, Sorting Grate Grid, Trawl Door Modification

export interface BrdConfiguration extends Base {
  operations?: CouchID[];

  lightConfig?: BrdLight;
  escapementConfig?: BrdEscapement;
  sortingGrateConfig?: BrdSortingGrateGrid;
  modifiedCodendMeshConfig?: BrdModifiedCodendMesh;
  trawlDoorModConfig?: BrdTrawlDoorModification;
  otherConfig?: BrdOther[];
}

export const BrdDeploymentTypeName = 'brd-deployment';

export interface BrdDeployment extends Base {
  // New for ASHOP
  operations?: CouchID[];
  targetSpecies?: Species[] | BrdTarget[]; // ASHOP: Need to include seabirds
  equipment?: BrdEquipmentType;
  locations?: BrdLocation[];
  colors?: BrdColor[]; // Usually Green
  pattern?: BrdPattern[];
}
