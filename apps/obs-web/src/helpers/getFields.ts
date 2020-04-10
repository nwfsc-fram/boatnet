import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';

export async function getTripsByDates(startDate: any, endDate: any, observerId: string) {
    const masterDB: Client<any> = couchService.masterDB;
    const trips: any[] = [];
    try {
        const tripDocs: any = await masterDB.viewWithDocs(
            'obs_web',
            'wcgop_trips_by_observerId',
            { key: observerId }
        );
        for (const trip of tripDocs.rows) {
            if (moment(trip.doc.returnDate).isAfter(startDate.toString()) &&
                moment(trip.doc.returnDate).isBefore(endDate.toString())) {
                trips.push(trip.doc);
            }
        }
        trips.sort((a: any, b: any) => {
            if (moment(a.departureDate).isBefore(b.departureDate)) {
                return -1;
            } else if (moment(a.departureDate).isAfter(b.departureDate)) {
                return 1;
            } else {
                return 0;
            }
        });
        return trips;
    } catch (err) {
        console.log('could not get trips from evaluation period');
    }
}
