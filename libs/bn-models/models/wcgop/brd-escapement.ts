import { BrdType } from "../_common/brd-type";
import { BrdTarget } from "../_common/brd-target";


export interface BrdEscapement  {
    targets?: BrdTarget[];
    brdType?: BrdType;
    location?: string[]; 
    illuminated?: boolean;
}