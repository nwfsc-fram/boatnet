import { Base } from '../_base/base';
import { CouchID, BoatnetUser } from '.';
import {
  BrdLight,
  BrdEscapement,
  BrdSortingGrateGrid,
  BrdModifiedCodendMesh,
  BrdTrawlDoorModification,
  BrdOther,
  BrdSnatchBlock,
  BrdWaterSprayer,
  BrdWarpBoom,
  BrdBuoyLine,
  BrdStreamerLine,
  BrdStrategyType,
  BrdLineWeighting
} from '../_lookups/brd-lookups';
import { Species } from '../_lookups';

export const BrdConfigurationTypeName = 'brd-configuration';
export interface BrdConfiguration extends Base {
  operations?: CouchID[];

  lightConfig?: BrdLight;
  escapementConfig?: BrdEscapement;
  sortingGrateConfig?: BrdSortingGrateGrid;
  modifiedCodendMeshConfig?: BrdModifiedCodendMesh;
  trawlDoorModConfig?: BrdTrawlDoorModification;
  otherConfig?: BrdOther[];
  snatchBlockConfig?: BrdSnatchBlock; // Seabird-only
  waterSprayerConfig?: BrdWaterSprayer;  // Seabird-only
  streamerLineConfig?: BrdStreamerLine; // Seabird-only
  warpBoomConfig?: BrdWarpBoom; // Seabird-only
  buoyLineConfig?: BrdBuoyLine;
  lineWeightingConfig?: BrdLineWeighting;

  strategies?: BrdStrategyType[]; 

  legacy?: {
    manufacturer?: string;
  }
}