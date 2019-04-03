
import { Measurement } from "../_common";
import { WcgopMmsbstBase } from "./wcgop-mmsbst-base";


// None of these values exist in the DB but these are all specifically mentioned on the paper form, and recorded (if recorded) as mass text into the note section.
// I think we should specifically capture this info outside of "notes" property going forward, more easily parsible/readable
export interface WcgopMmsbstMammal extends WcgopMmsbstBase {
    bodyFeatures: string;
    markings: string;
    coloration: Measurement;
    associatedOrganisms: string[];   

    // more as needed
}

