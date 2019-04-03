import { BrdType } from "../_common/brd-type";
import { BrdTarget } from "../_common/brd-target";

export interface BrdModifiedCodendMesh  {
    targets?: BrdTarget[];
    brdType?: BrdType;
    meshType?: string;
}