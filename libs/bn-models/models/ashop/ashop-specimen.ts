
// tslint:disable no-empty-interface
import { BaseSpecimen } from '../_base';

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

    legacy?: {
        cruiseNum?: number;
        permit?: string;
        haulSeq?: number;
        offloadSeq?: number;
        lengthSeq?: number;
    }
}