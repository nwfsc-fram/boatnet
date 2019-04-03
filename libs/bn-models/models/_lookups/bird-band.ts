import { Base } from "../_base";


export interface BirdBand extends Base { 
    whichLeg?: string;
    material?: string;
    colors?: string[];
    id?: string; 
}

