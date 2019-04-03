import { BrdType } from "../_common/brd-type";
import { BrdTarget } from "../_common/brd-target";


export interface BrdSortingGateGrid  {
    targets?: BrdTarget[];
    brdType?: BrdType;
    location?: string[]; // may not need an array on this type
    illuminated?: boolean;
}