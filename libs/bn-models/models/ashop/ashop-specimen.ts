
// tslint:disable no-empty-interface
import { BaseSpecimen } from '../_base';

export const AshopSpecimenTypeName = 'ashop-specimen';

export interface AshopSpecimen extends BaseSpecimen {
    legacy?: {
        cruiseNum?: number;
        permit?: string;
        haulSeq?: number;
        offloadSeq?: number;
        lengthSeq?: number;
    }
}