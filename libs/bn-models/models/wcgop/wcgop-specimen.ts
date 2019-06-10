import { BaseSpecimen } from '../_base';
import { WcgopDiscardReason } from './wcgop-discard-reason';
import { BoatnetDate } from '../_common';

declare type WcgopBiosampleMethod = any;

// Combines:
// BIO_SPECIMENS
// BIO_SPECIMEN_ITEMS
// LENGTH_FREQUENCIES
// DISSECTIONS

export const WcgopSpecimenTypeName = 'wcgop-specimen';

export interface WcgopSpecimen extends BaseSpecimen {
  biosampleMethod?: WcgopBiosampleMethod; // TODO - Random inside sample, Random outside sample
  discardReason?: WcgopDiscardReason;

  legacy?: {
    biospecimenId?: number;
    biospecimenItemId?: number;
    catchId?: number;
    specimenLengthKp?: number;
    specimenWeightKp?: number;
    lfLengthKp?: number;
    frequencyKp?: number;

    lengthFrequencyId?: number; // from ETL import transform

    // TODO Lab Analysis docstore structure for the following:
    age?: number;
    ageReader?: string;
    ageDate?: string;
    ageLocation?: string;
    ageMethod?: string;
    rackId?: string;
    rackPosition?: string;
    // -- End lab analysis docstore items --

    obsprodLoadDate?: BoatnetDate;

    // DISSECTION.BS_RESULT is null, skip it.
    // BIO_SPECIMEN_ITEMS.BAND_ID is null, skip it
  };
}
