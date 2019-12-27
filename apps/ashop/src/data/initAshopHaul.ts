import { AshopHaul, Measurement } from '@boatnet/bn-models';
import { MeasurementImpl } from './initMeasurement';

export class AshopHaulInit implements AshopHaul {
    public type: string = 'ashop-haul';
    public haulNum: number;

    public bottomDepth: Measurement = new MeasurementImpl('depth', 'fathoms');
    public fishingDepth: Measurement = new MeasurementImpl('depth', 'fathoms');

    public flowScaleCatch: {
        measurement: Measurement;
        weightMethod: string;
    } = {
        measurement: new MeasurementImpl('weight', 'kg'),
        weightMethod: 'W'
    };

    public vesselEstimatedCatch: {
        measurement: Measurement;
        weightMethod: string;
    } = {
        measurement: new MeasurementImpl('weight', 'MT'),
        weightMethod: 'W'
    };

    public officialTotalCatch: Measurement = new MeasurementImpl('weight', 'kg');

    constructor(haulNum: number) {
        this.haulNum = haulNum;
    }
}
