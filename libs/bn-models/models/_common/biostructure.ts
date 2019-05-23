import { BiostructureType } from '../_lookups/biostructure-type';
import { Base } from '../_base';
import { BoatnetDate } from './boatnet-date';
import { Protocol } from '../_lookups';

// TODO Lookups:
// cutting?: Biostructure; // for Corals / Sponges/ etc
// finClip?: Biostructure;
// finRay?: Biostructure;
// otolith?: Biostructure;
// ovary?: Biostructure;
// tissue?: Biostructure;
// stomach?: Biostructure;
// scales?: Biostructure;
// snout?: Biostructure;
// wholeSpecimen?: Biostructure;
export const BiostructureTypeName = 'biostructure';

declare type SamplingStrategy = string; // TODO Lookups

export interface Biostructure extends Base {
  structureType?: BiostructureType;
  label?: string; // Barcode Value
  // protocol?: Protocol; // sampling strategy / lab results possibilities

  legacy?: {
    dissectionId?: number;
    bioSpecimenItemId?: number;
    rackId?: number;
    rackPosition?: string;
    bsResult?: string;
    cwtCode?: string; // coded wire tag for Salmon
    cwtStatus?: string;
    cwtType?: string;
    age?: number;
    ageReader?: string;
    ageDate?: string;
    ageLocation: string;
    ageMethod: string;

    bandId?: string;
  };
}
