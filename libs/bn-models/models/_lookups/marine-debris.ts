import { Base } from '../_base/index';
import { Program } from './program';

declare type MajorCategory = string; // TODO - Lookup - Define
declare type MinorCategory = string; // TODO - Lookup - Define

export const DebrisTypeName = 'debris';
/* tslint:disable:no-empty-interface */
export interface MarineDebris extends Base {
    majorCategory: MajorCategory;
    minorCategory?: MinorCategory;
    programs?: Program[];
    isFishingRelated?: boolean;
    isMilitaryRelated?: boolean;
}
