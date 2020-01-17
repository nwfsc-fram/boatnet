import { AshopHaul, Measurement, WcgopOperation, initMeasurement, BaseOperation, NonFlowScaleCatch } from '@boatnet/bn-models';

const lbsToKgFormula = 1 / 2.2046;

export function update(haul: AshopHaul, fieldName: string) {
    haul.officialTotalCatch = setOfficialTotalCatch(haul);
    // apply depth units to both fishing and bottom depth
    if (haul.fishingDepth) {
        haul.fishingDepth.units = haul.bottomDepth ? haul.bottomDepth.units : '';
    }
    setFishingLocationUnits(haul, fieldName);
}

// set startFishingLocation units and endFishingLocation units equal to each other
function setFishingLocationUnits(haul: BaseOperation, fieldName: string) {
    if (fieldName === 'startFishingLocation') {
        haul.endFishingLocation.unit = haul.startFishingLocation.unit;
    } else if (fieldName === 'endFishingLocation') {
        haul.startFishingLocation.unit = haul.endFishingLocation.unit;
    }
}

function convertNonFlowScaleCatchToKg(nonFishingLoc: NonFlowScaleCatch) {
    if (nonFishingLoc.rawInputMeasurement.units === 'kg') {
        nonFishingLoc.officialMeasurement = nonFishingLoc.rawInputMeasurement;
     } else {
        nonFishingLoc.officialMeasurement = {
            value: getMeasurementVal(nonFishingLoc.rawInputMeasurement) * lbsToKgFormula,
            units: 'kg'
         };
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

// calculate official total catch
function setOfficialTotalCatch(haul: AshopHaul): Measurement {
    let observerEstCatch: number = 0;
    const flowScaleMeasurement = haul.flowScaleCatch ? haul.flowScaleCatch.measurement : {};
    const nonFlowScaleCatch: NonFlowScaleCatch[] = haul.nonFlowScaleCatch ? haul.nonFlowScaleCatch : [];
    const vesselEstMeasurement = haul.vesselEstimatedCatch ? haul.vesselEstimatedCatch.measurement : {};

    observerEstCatch += getMeasurementVal(flowScaleMeasurement);
    observerEstCatch = observerEstCatch * .001; // convert from kg to mt

    for (const nonFlowScaleWt of nonFlowScaleCatch) {
        convertNonFlowScaleCatchToKg(nonFlowScaleWt);
        observerEstCatch += (getMeasurementVal(nonFlowScaleWt.officialMeasurement) * .001);
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
