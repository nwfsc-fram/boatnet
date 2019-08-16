
// tslint:disable no-empty-interface
import { BaseSpecimen } from '../_base';

export const AshopSpecimenTypeName = 'ashop-specimen';

// column notes : sex, length, weight, biostructures, tags
// species specific: salmon - isAdiposePresent, halibut - viability

export interface AshopSpecimen extends BaseSpecimen {
    legacy?: {
        cruiseNum?: number;
        permit?: string;
        haulSeq?: number;
        offloadSeq?: number;
        lengthSeq?: number;
    }
}