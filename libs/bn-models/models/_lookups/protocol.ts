import { Base } from '../_base/index';
import { Person } from 'normalize-package-data';
import { TaxonomyAlias } from './taxonomy-alias';
import { Measurement } from '../_common';

export const ProtocolTypeName = 'protocol';

declare type ObservationType = string; // TODO - Lookup
declare type BiostructureType = string; // TODO - Lookup
declare type Stratum = string; // TODO - Lookup

export interface Protocol extends Base {
  taxonomy: TaxonomyAlias;
  principalInvestigator: Person;      // Who

  observations: ObservationType[];    // What
  biostructures: BiostructureType[];  // What

  // TODO - Next Meeting
  // 1. How do define strata?
  // 2. How do def`ine comingled observations/structures?
  //      What am I doing on this age sample?
  //        maybe just need to define a given subsample
  // 3. How to capture a special project PI wanting standard data as well?
  //        Harvey wants a gill, but also FRAM sex, length

  strata?: Stratum[];

  // Who, what, when, how

  isSpecialProjectProtocol?: boolean;
}
