import { BaseContainer } from '../_base/index';
import { BoatnetDate } from '../_common';

export const HakeSurveyBasketTypeName = 'hake-survey-basket';

export interface HakeSurveyBasket extends BaseContainer {
  legacy?: {
    speciesCompItemId?: number;
    speciesCompBasketId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
