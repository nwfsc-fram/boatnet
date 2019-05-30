import { BaseContainer } from '../_base/index';
import { BoatnetDate } from '.';

export const BasketTypeName = 'basket';

export interface Basket extends BaseContainer {
  legacy?: {
    speciesCompItemId?: number;
    speciesCompBasketId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
