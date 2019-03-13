// Base Event - Fishing Locations, etc

import { Base } from './base';
import { BoatnetDate, Measurement } from '../_common/index';
// TODO Import GEOJSON
// import { Point } from 'geo-json';

export interface BaseEvent extends Base {
    // TODO Result property?
    // location: Point;  // TODO GEOJSON
    depth?: Measurement;
    date: BoatnetDate;
}
