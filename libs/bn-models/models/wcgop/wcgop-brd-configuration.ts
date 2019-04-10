
import { Base } from '../_base/base';
import { CouchID, BoatnetUser } from '../_common';
import { BrdLight } from './brd-light';
import { BrdEscapement } from './brd-escapement';
import { BrdSortingGateGrid } from './brd-sorting-grate-grid';
import { BrdModifiedCodendMesh } from './brd-modified-codend-mesh';
import { BrdTrawlDoorModification } from './bd-traw-door-modification';
import { BrdOther } from './brd-other';

export interface BrdConfiguration extends Base {
    operations?: CouchID[];
    trip?: CouchID;
    observer?: BoatnetUser;

    lightConfig?: BrdLight;
    escapmentConfig?: BrdEscapement;
    sortingGrateConfig?: BrdSortingGateGrid;
    modifiedCodendMeshConfig?: BrdModifiedCodendMesh;
    trawlDoorModConfig?: BrdTrawlDoorModification;
    otherConfig?: BrdOther[];

}
