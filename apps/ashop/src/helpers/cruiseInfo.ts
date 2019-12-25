import { pouchService } from '@boatnet/bn-pouch';
import { AshopCruise, CouchID } from '@boatnet/bn-models';
import { remove } from 'lodash';

let cruise: AshopCruise;
const db = pouchService.db;

export async function getCruise(type: string, docs: any) {
    cruise = docs.filter((row: any) => row.doc.type === type + '-cruise');
    cruise = cruise[0] ? cruise[0].doc : undefined;
    return cruise;
}

export async function getTrips() {
    const tripIds = cruise ? cruise.trips : [];
    const queryOptions = {
        keys: tripIds,
        descending: true
    };
    try {
        const result = await db.allDocs(
            queryOptions
        );
        return result.rows;
    } catch (error) {
        console.log(error);
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
        db.put(pouchService.userDBName, cruise);
    } else {
        const newCruise = { type: 'ashop-cruise', trips: [tripId] };
        db.post(pouchService.userDBName, newCruise);
    }
}

export function deleteCruise(tripId: CouchID) {
    if (cruise.trips) {
        remove(cruise.trips, (n: string) => n === tripId);
    }
    db.put(pouchService.userDBName, cruise).then((response: any) => {
        cruise._id = response.id;
        cruise._rev = response.rev;
    });
}
