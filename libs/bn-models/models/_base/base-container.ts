import { Base } from './base';
import { Measurement } from '../_common/index';
import { MeasurementDevice } from '../_lookups/index';

export interface BaseContainer extends Base {
    // Basket-level Record
    // Use createdDate for sequence
    count?: number;
    weight?: Measurement;
    tareWeight?: Measurement; // The future: auto-populated
    isSubsample?: boolean;
    measurementDevice?: MeasurementDevice;
}
