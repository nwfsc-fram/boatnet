
import { Base } from './base';
import { BrdTarget } from '../_common/brd-target';
import { BrdType } from '../_common/brd-type';
import { CouchID, BoatnetUser } from '../_common';

export interface BaseBrd extends Base {
    targets?: BrdTarget[];
    brdType?: BrdType;
    hauls?: CouchID[];
    trip?: CouchID;
    observer?: BoatnetUser;
}
