import { BrdType } from "../_common/brd-type";
import { BrdTarget } from "../_common/brd-target";

// Adhoc Brd type
export interface BrdOther {    
    targets?: BrdTarget[];
    brdType?: BrdType;
    location?: string[];
}