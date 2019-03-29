import { BaseMmsbst } from "../_base/base-mmsbst";
import { Measurement } from "../_common";


// None of these values exist in the DB but these are all specifically mentioned on the paper form, and recorded (if recorded) as mass text into the note section.
// I think we should specifically capture this info outside of "notes" property going forward, more easily parsible/readable
export interface MmsbstMammal extends BaseMmsbst {
    bodyFeatures: string;
    markings: string;
    coloration: Measurement;
    associatedOrganisms: string[];    
    // Maybe more
}

