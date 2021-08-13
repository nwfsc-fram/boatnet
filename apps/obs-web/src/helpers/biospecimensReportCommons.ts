import { get, slice } from 'lodash'

export async function createResult(
    trip: any,
    operation: any,
    bio: any,
    rack: any,
    path: string[]
) {
    const jp = require('jsonpath');
    const catchPath = jp.stringify(slice(path, 0, 3));
    const speciesPath = jp.stringify(slice(path, 0, 5));
    const specimenPath = jp.stringify(slice(path, 0, 7));

    return {
        position: get(bio, 'legacy.rackPosition'),
        tripNum: get(operation, 'legacy.tripId'),
        haulNum: get(operation, 'operationNum'),
        catchNum: jp.value(operation, catchPath + '.catchNum'),
        species: jp.value(
            operation,
            speciesPath + '.catchContent.commonNames[0]'
        ),
        dissection: get(bio, 'structureType.description'),
        label: get(bio, 'label'),
        received: get(bio, 'isReceived', 'No'),
        cwtStatus: get(bio, 'legacy.cwtStatus'),
        cwtCode: get(bio, 'legacy.cwtCode'),
        cwtType: get(bio, 'legacy.cwtType'),
        doc: operation.doc,
        id: operation.value,
        age: get(bio, 'legacy.age'),
        ageReader: get(bio, 'legacy.ageReader'),
        ageDate: get(bio, 'legacy.ageDate'),
        ageLocation: get(bio, 'legacy.ageLocation'),
        ageMethod: get(bio, 'legacy.ageMethod'),
        rack: get(rack, 'doc.rackName'),
        rackLocation: get(rack, 'doc.rackLocation'),

        // haul report attributes
        gearType: get(operation, 'gearType.description'),
        gearPerformance: get(operation, 'gearPerformance.description'),
        haulUpDate: get(operation, 'locations[0].locationDate'),
        haulUpCoord: [
            get(operation, 'locations[0].location.coordinates[0]'),
            get(operation, 'locations[0].location.coordinates[1]'),
        ],
        haulSetDate: get(operation, 'locations[1].locationDate'),
        haulSetCoord: [
            get(operation, 'locations[1].location.coordinates[0]'),
            get(operation, 'locations[1].location.coordinates[1]'),
        ],

        // trip report attributes
        observer:
            get(trip, 'observer.firstName') +
            ' ' +
            get(trip, 'observer.lastName'),
        vessel: get(trip, 'vessel.vesselName'),
        departureDate: get(trip, 'departureDate', ''),
        departurePort: get(trip, 'departurePort.name', ''),
        sex: jp.value(operation, specimenPath + '.sex'),
        length: jp.value(operation, specimenPath + '.length.value'),
        returnDate: get(trip, 'returnDate', ''),
        returnPort: get(trip, 'returnPort.name', ''),
        fishery: get(trip, 'fishery.description', ''),

        weight: jp.value(operation, specimenPath + '.weight.value'),
        tag: jp.value(operation, specimenPath + '.tags[0]'),
    };
}
