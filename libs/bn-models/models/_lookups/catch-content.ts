import { Base } from '../_base/index';
import { BoatnetDate, CouchID } from '../_common';
import { TaxonomyId } from './taxonomy';

export const CatchContentTypeName = 'catch-content';

declare type ContentType = string; // Taxonomy, Debris, Groups
declare type Lifestage = string; // eggs, juvenile, adult
declare type Condition = string; // Might want a different name, this is for decomposed, etc.
// decomposed, empty shells, (no biology), gelatenous material
// shab (usually biological), miscellaneous bottom items (from WCGOP Catch Category)

export interface CatchContent extends Base {
  contentType: ContentType;
  taxonomy?: TaxonomyId;
  catchGrouping?: CouchID;
  displayName: string;
  lifestage?: Lifestage;
  condition?: Condition;
}
