import { pouchService } from '@boatnet/bn-pouch';
import { AshopCruise, CouchID } from '@boatnet/bn-models';
import { remove } from 'lodash';
import { allDocs } from './queries';

let cruise: AshopCruise;
const db = pouchService.db;

export async function getDocByType(program: string, type: string) {
    const designDoc = {
        _id: '_design/docType',
        views: {
            by_type: {
                map: function (doc) { emit(doc.type); }.toString()
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
        .catch(async function (err: any) {
            await db.put(designDoc);
            return await db.query('docType/by_type', queryOptions)
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
        const tripIds = cruise ? cruise.trips : [];
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

// TODO
// 1. call cruise API to generate friendly cruiseNum
// 2. Find a way to indicate which cruise is active on the userDB. Either remove
// all inactive data each time a cruise ends. Or add a column that
// indicates whether cruise is active.
export function updateCruise(tripId: CouchID) {
    if (cruise) {
        cruise.trips ? cruise.trips.push(tripId) : (cruise.trips = [tripId]);
        db.put(cruise);
    } else {
        const newCruise = { type: 'ashop-cruise', trips: [tripId] };
        db.post(newCruise);
    }
}

export function deleteCruise(tripId: CouchID) {
    if (cruise.trips) {
        remove(cruise.trips, (n: string) => n === tripId);
    }
    db.put(cruise).then((response: any) => {
        cruise._id = response.id;
        cruise._rev = response.rev;
    });
}
