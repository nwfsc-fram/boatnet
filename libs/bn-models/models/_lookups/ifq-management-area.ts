import { Base } from "../_base";
import { BoatnetDate } from "../_common";
import { MultiLineString } from "geojson";

declare type ManagementType = string; // TODO - define lookup - IFQ, FMP, etc.

export const IfqManagementAreaTypeName = 'ifq-management-area';

export interface ManagementArea extends Base {
    name: string;
    year: BoatnetDate;
    geography: MultiLineString;  // 2 lines only per management area
    managementType: ManagementType;

    legacy?: {
    };
}