import { Measurement } from '@boatnet/bn-models';

export class MeasurementImpl implements Measurement {
    public measurementType: string;
    public units: string;

    constructor(measurementType: string, units: string) {
        this.measurementType = measurementType;
        this.units = units;
    }
}
