// Base Event - Fishing Locations, etc

import { BoatnetDate, Measurement } from '../_common/index';
import { Point } from 'geojson'; // GeoJSON https://tools.ietf.org/html/rfc7946
import { Base } from './base';

export interface BaseEvent extends Base  {
    location?: Point;
    depth?: Measurement;
    date?: BoatnetDate;
}
