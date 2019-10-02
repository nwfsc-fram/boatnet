import { Base } from '../_base/index';
import { Taxonomy } from './taxonomy';

export const TaxonomyAliasTypeName = 'taxonomy-alias';

declare type AliasType = string; // Lookup
declare type Lifestage = string; // eggs, juvenile, adult
declare type Condition = string; // Might want a different name, this is for decomposed, etc.

export interface TaxonomyAlias extends Base {
  taxonomy: Taxonomy; // Use this instead of _id for clarity except for top level record
  alias: string; // Rockfish, Canary
  aliasType: AliasType; // Lookup - Common Name, WCGOP Tally Short Code, Pacfin Species Code, etc.

  // Possible for multiple unid's (purple v. blue corals)
  // fieldDefinition?: string; // REVIEW REVIEW REVIEW
  isFieldDefinition?: boolean; // custom record added in the field, typically

  // purple v. red anemonae
  // for unid species, like coral #1, coral #2


  // QUESTION - What about those species that don't have a taxonomy?

  wcrIfqSpeciesGroupId?: number;  // From OBSPROD IFQ_SPECIE_GROUPING table
  // may end different

  // Groupings at the catch level
  lifestage?: Lifestage;
  condition?: Condition; // such as Crushed (for urchins), decomposed, regurgitated

  // Program-specific indicators
  isAshop?: boolean;
  isWcgop?: boolean;
  isTrawlSurvey?: boolean;
  isHakeSurvey?: boolean;
  isHookAndLineSurvey?: boolean;
  isPacfin?: boolean;
}
