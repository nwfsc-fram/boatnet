import { Base } from '../_base/index';
import { BoatnetDate, CouchID } from '../_common';
import { Taxonomy } from './taxonomy';
import { BooleanLiteral } from 'typescript';

export const TaxonomyAliasTypeName = 'taxonomy-alias';

declare type Program = any; // Lookup
declare type AliasType = string; // Lookup
declare type Lifestage = string; // eggs, juvenile, adult
declare type Condition = string; // Might want a different name, this is for decomposed, etc.

export interface TaxonomyAlias extends Base {
  taxonomy: Taxonomy; // Use this instead of _id for clarity except for top level record
  alias: string; // Rockfish, Canary
  aliasType: AliasType; // Lookup - Common Name, WCGOP Tally Short Code, etc.
  lifestage?: Lifestage;
  condition?: Condition;
  isAshop?: boolean;
  isWcgop?: boolean;
  isTrawlSurvey?: boolean;
  isHakeSurvey?: boolean;
  isHookAndLineSurvey?: boolean;
}
