declare type BiostructureType = string;

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

export interface Biostructure {
  structureType: BiostructureType;
  label: string; // Barcode Value
}
