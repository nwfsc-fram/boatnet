import { BaseContainer } from "../_base/index";

export interface WcgopBasket extends BaseContainer {
    legacy?: {
        speciesCompItemId?: number;
        speciesCompBasketId?: number;
    }
}
