import { pouchService } from '@boatnet/bn-pouch';
import { AshopCruise, CouchID } from '@boatnet/bn-models';
import { remove } from 'lodash';
import { allDocs } from './queries';

let cruise: AshopCruise;
const db = pouchService.db;

export async function getCruise(type: string, docs: any) {
    cruise = docs.filter((row: any) => row.type === type + '-cruise');
    cruise = cruise[0] ? cruise[0] : undefined;
    return cruise;
}

export async function getTrips() {
    const tripIds = cruise ? cruise.trips : [];
    const queryOptions = {
        keys: tripIds,
        descending: true
    };
    return await allDocs(queryOptions, pouchService.userDBName);
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
