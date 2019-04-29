import { OTSUser } from './ots-user';
import { BoatnetDate } from '../_common';
import { Base } from '../_base';

export interface OTSMessage extends Base {
    author: OTSUser;
    text: string;
    datetime: BoatnetDate;
  }