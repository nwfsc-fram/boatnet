import { Base } from './base';
import { Measurement } from '../_common/index';

export interface BaseContainer extends Base {
    // Use createdDate for sequence
    count?: number;
    weight: Measurement;
    tareWeight?: Measurement;
    isSubsample?: boolean;
    measurementDevice?: MeasurementDevice;
}
