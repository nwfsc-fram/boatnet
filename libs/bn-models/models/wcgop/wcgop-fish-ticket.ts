// TODO interface definition
import { Base } from '../_base';
import {BoatnetDate} from '../_common/index';

export const WcgopFishTicketTypeName = 'wcgop-fish-ticket';

export interface WcgopFishTicket extends Base {
  fishNum?: number;
  date?: BoatnetDate;
  state?: string;

  // legacy??
}
