import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';

export async function getTripsByDates(startDate: any, endDate: any, observerId: string) {
    const trips = await getTripsByObserverId(observerId);
    return trips.filter((trip: any) => {
        const returnDate = trip.returnDate;
        if (returnDate && moment(returnDate).isAfter(startDate.toString()) &&
            moment(returnDate).isBefore(endDate.toString())) {
                return trip;
        }
    });
}

export async function getTripsByObserverId(observerId: string) {
    const jp = require('jsonpath');
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const tripDocs: any = await masterDB.viewWithDocs(
            'obs_web',
            'wcgop_trips_by_observerId',
            { key: observerId }
        );
        const trips = jp.query(tripDocs, '$.rows[*].doc');
        trips.sort((a: any, b: any) => {
            if (moment(a.departureDate).isBefore(b.departureDate)) {
                return 1;
            } else if (moment(a.departureDate).isAfter(b.departureDate)) {
                return -1;
            } else {
                return 0;
            }
        });
        return trips;
    } catch (err) {
        console.log('could not get trips from evaluation period');
    }
}
