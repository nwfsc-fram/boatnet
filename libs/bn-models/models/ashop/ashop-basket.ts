import { BaseContainer } from "../_base/index";

export interface AshopBasket extends BaseContainer {
    legacy?: {
        speciesCompItemId?: number;
        speciesCompBasketId?: number;
    }
}
