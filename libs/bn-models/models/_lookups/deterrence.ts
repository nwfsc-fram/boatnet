import { Base } from "../_base";
import { BoatnetDate } from "../_common";
import { DeterrenceType } from "./deterrence-type";

export const DeterrenceTypeName = 'deterrence';

export interface Deterrence extends Base { 
    deterrenceType?: DeterrenceType; // lookup value
    successful?: boolean;
    executionDescription?: string;
}
