import { BaseBrd } from "../_base/base-brd";

export interface BrdLight extends BaseBrd {
    numSingleRigged?: number;
    numDoubleRiggedPort?: number;
    numDoubleRiggedStarboard?: number;
    colors?: string[]; // vast majority of records use only one option
    pattern?: string[]; // vast majority of records use only one option
    manufacturer?: string[]; // vast majority of records use only one option
    location?: string[]; // vast majority of records use only one option

}