import { Base } from '../_base/base';
import { CouchID, BoatnetUser } from '.';
import {
  BrdLight,
  BrdEscapement,
  BrdSortingGrateGrid,
  BrdModifiedCodendMesh,
  BrdTrawlDoorModification,
  BrdOther
} from '../_lookups/brd-lookups';

export const BrdConfigurationTypeName = 'brd-configuration';

export interface BrdConfiguration extends Base {
  operations?: CouchID[];
  lightConfig?: BrdLight;
  escapementConfig?: BrdEscapement;
  sortingGrateConfig?: BrdSortingGrateGrid;
  modifiedCodendMeshConfig?: BrdModifiedCodendMesh;
  trawlDoorModConfig?: BrdTrawlDoorModification;
  otherConfig?: BrdOther[];
}
