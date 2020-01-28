import { pouchService } from '@boatnet/bn-pouch';
import { Base, AshopCruise, CouchID } from '@boatnet/bn-models';
import { remove } from 'lodash';
import { allDocs } from './queries';

let cruise: AshopCruise;
const db = pouchService.db;

export async function getDocByType(program: string, type: string) {
    const designDoc = {
        _id: '_design/docType',
        views: {
            by_type: {
                // @ts-ignore
                map: function(doc) { emit(doc.type); }.toString()
            }
        }
    };
    const queryOptions = {
        inclusive_end: true,
        ascending: false,
        include_docs: true,
        reduce: false,
        key: program + '-' + type
    };
    let results: any = await db.query('docType/by_type', queryOptions)
        .catch(async (err: any) => {
            await db.put(designDoc);
            return await db.query('docType/by_type', queryOptions);
        });
    results = results.rows;
    for (let i = 0; i < results.length; i++) {
        results[i] = results[i].doc;
    }
    return results;
}

export async function getTrips(appMode: string) {
    if (appMode === 'ashop') {
        const cruises = await getDocByType(appMode, 'cruise');
        cruise = cruises[0];
        const tripIds = cruise && cruise.trips ? cruise.trips : [];
        const queryOptions = {
            keys: tripIds,
            descending: true
        };
        return await allDocs(queryOptions, pouchService.userDBName);
    } else if (appMode === 'wcgop') {
        const wcgopTrips = getDocByType(appMode, 'trip');
        return wcgopTrips;
    }
}

export async function createCruise() {
    const cruises = await getDocByType('ashop', 'cruise');
    if (cruises && cruises.length === 0) {
        const cruiseNum: number = 100001; // TODO use API to generate cruiseId
        const newCruise: Base = { type: 'ashop-cruise', cruiseNum };
        await db.post(newCruise).then((response: any) => {
            newCruise._id = response.id;
            newCruise._rev = response.rev;
        });
        return newCruise;
    }
}

export function addTripIdToCruise(tripId: CouchID) {
    cruise.trips ? cruise.trips.push(tripId) : (cruise.trips = [tripId]);
    db.put(cruise).then((response: any) => {
        cruise._id = response.id;
        cruise._rev = response.rev;
    });
}

export function removeTripIdFromCruise(tripId: CouchID) {
    if (cruise.trips) {
        remove(cruise.trips, (n: string) => n === tripId);
    }
    db.put(cruise).then((response: any) => {
        cruise._id = response.id;
        cruise._rev = response.rev;
    });
}
