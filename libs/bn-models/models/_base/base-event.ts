// Base Event - Fishing Locations, etc

import { BoatnetDate, Measurement } from '../_common/index';
import { Point } from 'geojson'; // GeoJSON https://tools.ietf.org/html/rfc7946

export interface BaseEvent  {
    // TODO Result property?
    location: Point;
    depth?: Measurement;
    date: BoatnetDate;
}
