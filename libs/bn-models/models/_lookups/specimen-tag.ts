
import { Base } from "../_base";
import { Species } from "./species";
import { Measurement } from "../_common";

export interface SpecimenTag extends Base { 
    eventNum?: number;
    species?: Species;
    specimenNum?: number;
    age?: Measurement;
    specimenType?: string;
    tagColor?: Measurement;
    tagType?: string;
    tagLocation?: string;
    tagPosition?: string;
    tagNum?: number;
    comments?: string;    
}

