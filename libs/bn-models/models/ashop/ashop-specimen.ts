
// tslint:disable no-empty-interface
import { BaseSpecimen } from '../_base';
import { Condition, SampleSystem } from '../_lookups';

export const AshopSpecimenTypeName = 'ashop-specimen';


export interface AshopSpecimen extends BaseSpecimen {
    /* Columns to show from BaseSpecimen in the UI
    specimenNumber
    sex
    length
    weight
    biostructures
    tags

    Species specific: 
    salmon - isAdiposePresent
    halibut - viability
    */

    condition?: Condition;
    sampleSystem?: SampleSystem;

    legacy?: {
        cruiseNum?: number;
        permit?: string;
        haulSeq?: number;
        offloadSeq?: number;
        lengthSeq?: number;
    }
}