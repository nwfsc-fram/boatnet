import { BaseContainer } from '../_base/index';
import { BoatnetDate } from '../_common';

export const WcgopBasketTypeName = 'wcgop-basket';

export interface WcgopBasket extends BaseContainer {
  legacy?: {
    speciesCompItemId?: number;
    speciesCompBasketId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
