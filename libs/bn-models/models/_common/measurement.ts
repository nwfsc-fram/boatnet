import { MeasurementDevice } from '../_lookups';

export interface Measurement {
  measurementDevice?: MeasurementDevice; // Lookup
  measurementType?: string; // TODO Lookup
  value?: number | string;
  units?: string;
}
