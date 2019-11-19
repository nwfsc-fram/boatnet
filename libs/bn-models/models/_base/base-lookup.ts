
import { Base } from './base';

export interface BaseLookup extends Base  {

    description?: string;
    lookupValue?: string;
    isActive?: boolean;

    isAshop?: boolean;
    isWcgop?: boolean;
    isTrawlSurvey?: boolean;
    isHakeSurvey?: boolean;
    isHookAndLineSurvey?: boolean;
    isCommon?: boolean;

}
