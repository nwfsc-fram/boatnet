
import { Measurement } from "../_common";
import { BirdBand } from "../_lookups/bird-band";
import { Base } from "../_base";


// None of these values exist in the DB but these are all specifically mentioned on the paper form, and recorded (if recorded) as mass text into the note section.
// I think we should specifically capture this info outside of "notes" property going forward, more easily parsible/readable
export interface WcgopMmsbstBird extends Base {
    plumageColoration: Measurement;
    beakSize: Measurement;
    bodySize: Measurement;
    billColor: Measurement;
    footColor: Measurement;
    birdBands?: BirdBand[];
    // more as needed
}

