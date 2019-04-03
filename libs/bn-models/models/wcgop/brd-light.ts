import { BrdType } from "../_common/brd-type";
import { BrdTarget } from "../_common/brd-target";


export interface BrdLight {
    targets?: BrdTarget[];
    brdType?: BrdType;
    numSingleRigged?: number;
    numDoubleRiggedPort?: number;
    numDoubleRiggedStarboard?: number;

    // vast majority of records use only one option for these four attributes
    colors?: string[]; 
    pattern?: string[]; 
    manufacturer?: string[];
    location?: string[];

}