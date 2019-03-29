import { BaseBrd } from "../_base/base-brd";

export interface BrdEscapement extends BaseBrd {
    location?: string[]; // may not need an array on this type
    illuminated?: boolean;
}