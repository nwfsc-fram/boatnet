import { BaseSpecimen } from '../_base';
import { WcgopDiscardReason } from './wcgop-discard-reason';
import { BoatnetDate } from '../_common';

declare type WcgopBiosampleMethod = any;

// Combines:
// BIO_SPECIMENS
// BIO_SPECIMEN_ITEMS
// LENGTH_FREQUENCIES
// DISSECTIONS

export interface WcgopSpecimen extends BaseSpecimen {
  biosampleMethod?: WcgopBiosampleMethod; // TODO
  discardReason?: WcgopDiscardReason;
  isAdiposePresent?: boolean;
  bandId?: string; // from DISSECTION.BAND_ID
  cwtCode?: string; // coded wire tag for Salmon
  cwtStatus?: string;
  cwtType?: string;

  legacy?: {
    biospecimenId?: number;
    biospecimenItemId?: number;
    catchId?: number;
    specimenLengthKp?: number;
    specimenWeightKp?: number;
    lfLengthKp?: number;
    frequencyKp?: number;

    lengthFrequencyId?: number; // from ETL import transform

    // TODO Lab Analysis docstore for the following:
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
