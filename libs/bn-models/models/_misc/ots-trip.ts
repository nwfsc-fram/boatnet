import { OTSMessage } from './ots-message';
import { WcgopTrip } from '../wcgop';


export interface OTSTrip extends WcgopTrip {
    isSelected: boolean;
    messages: OTSMessage[];
    permits?: any[] ;
  }
