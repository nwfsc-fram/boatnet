import { Measurement } from '@boatnet/bn-models';

export class MeasurementImpl implements Measurement {
    public measurmentType: string;
    public units: string;

    constructor(measurementType: string, units: string) {
        this.measurmentType = measurementType;
        this.units = units;
    }
}
