import { AshopHaul, Measurement, WcgopOperation } from '@boatnet/bn-models';
import { MeasurementImpl } from './initMeasurement';

export function initAshopHaul(haulNum: number) {
    const ashopHaul: AshopHaul = {
        type: 'ashop-haul',
        haulNum,
        bottomDepth: new MeasurementImpl('depth', 'fathoms'),
        fishingDepth: new MeasurementImpl('depth', 'fathoms'),
        flowScaleCatch: {
            measurement: new MeasurementImpl('weight', 'kg'),
            weightMethod: 'W'
        },
        vesselEstimatedCatch: {
            measurement: new MeasurementImpl('weight', 'MT'),
            weightMethod: 'W'
        },
        officialTotalCatch: new MeasurementImpl('weight', 'kg')
    };
    return ashopHaul;
}

export function initWcgopHaul(operationNum: number) {
    const wcgopHaul: WcgopOperation = {
        type: 'wcgop-haul',
        operationNum
    };
    return wcgopHaul;
}
