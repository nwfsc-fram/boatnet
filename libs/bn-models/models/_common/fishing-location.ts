import { Base } from '../_base/base';
import { BoatnetDate, Measurement } from '.';
import { Point } from 'geojson';

export const FishingLocationTypeName = 'fishing-location'; 

export interface FishingLocation extends Base {

    locationDate?: BoatnetDate
    location?: Point;
    depth?: Measurement;
    position?: number;

    legacy?: {
        fishingLocationId?: number,
        fishingActivityId?: number
    }
}