import { AshopHaul, Measurement, WcgopOperation } from '@boatnet/bn-models';
import { initMeasurement } from '@boatnet/bn-models/src/models/_common/measurement';

export function update(haul: AshopHaul) {
    haul.officialTotalCatch = setOfficialTotalCatch(haul);
    if (haul.fishingDepth) {
        haul.fishingDepth.units = haul.bottomDepth ? haul.bottomDepth.units : '';
    }
}

function getMeasurementVal(measurement: Measurement): number {
    if (measurement && measurement.value) {
        if (typeof measurement.value === 'string') {
            return parseInt(measurement.value, 10);
        } else {
            return measurement.value;
        }
    }
    return 0;
}

function setOfficialTotalCatch(haul: AshopHaul): Measurement {
    let observerEstCatch: number = 0;
    const flowScaleMeasurement = haul.flowScaleCatch ? haul.flowScaleCatch.measurement : {};
    const nonFlowScaleCatch = haul.nonFlowScaleCatch ? haul.nonFlowScaleCatch : [];
    const vesselEstMeasurement = haul.vesselEstimatedCatch ? haul.vesselEstimatedCatch.measurement : {};

    observerEstCatch += getMeasurementVal(flowScaleMeasurement);

    for (const nonFlowScaleWt of nonFlowScaleCatch) {
        observerEstCatch += getMeasurementVal(nonFlowScaleWt.measurement);
    }
    if (!observerEstCatch) {
        observerEstCatch += getMeasurementVal(vesselEstMeasurement);
    }
    return {
        measurementType: 'weight',
        units: 'kg',
        value: observerEstCatch
    };
}

export function initAshopHaul(haulNum: number): AshopHaul {
    const ashopHaul: AshopHaul = {
        type: 'ashop-haul',
        haulNum,
        bottomDepth: initMeasurement('depth', 'fathoms'),
        fishingDepth: initMeasurement('depth', 'fathoms'),
        flowScaleCatch: {
            measurement: initMeasurement('weight', 'kg'),
            weightMethod: 'W'
        },
        vesselEstimatedCatch: {
            measurement: initMeasurement('weight', 'MT'),
            weightMethod: 'W'
        },
        officialTotalCatch: initMeasurement('weight', 'kg'),
        nonFlowScaleCatch: []
    };
    return ashopHaul;
}

export function initWcgopHaul(operationNum: number): WcgopOperation {
    const wcgopHaul: WcgopOperation = {
        type: 'wcgop-haul',
        operationNum
    };
    return wcgopHaul;
}
