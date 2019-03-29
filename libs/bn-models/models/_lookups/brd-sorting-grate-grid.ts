import { BaseBrd } from "../_base/base-brd";

export interface BrdSortingGateGrid extends BaseBrd {
    location?: string[]; // may not need an array on this type
    illuminated?: boolean;
}