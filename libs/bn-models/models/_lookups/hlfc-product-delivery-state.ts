import { Base } from '../_base';
import { BoatnetDate } from '../_common';

export const HlfcProductDeliveryStateTypeName = 'hlfc-product-delivery-state';

export interface HlfcProductDeliveryState extends Base {
  description?: string;

  legacy?: {
    lookupVal?: number;
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}