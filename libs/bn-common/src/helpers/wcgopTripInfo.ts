import { mongoRead } from './trips-api';
import { dbConfig } from './config';
import { get } from 'lodash';
import { EvaluationPeriods } from '@boatnet/bn-models';
import { Base } from './base';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';

class WcgopTripImpl extends Base {
    constructor(type: string) {
        super(type);
    }

    async getTripsByEvaluationPeriod(evaluationPeriod: EvaluationPeriods) {
        if (this.type === 'mongo') {
            const queryParams = {
                departureDate: {
                    $gt: evaluationPeriod.startDate
                },
                returnDate: {
                    $lt: evaluationPeriod.endDate
                },
                "observer._id": evaluationPeriod.observer,
            }
            return await mongoRead('masterdb', 'trips', queryParams);
        } else {
            const masterDB: Client<any> = couchService.masterDB;
            const jp = require('jsonpath');

            const startDate = get(evaluationPeriod, 'startDate', '');
            const endDate = get(evaluationPeriod, 'endDate', '');

            try {
                const tripDocs: any = await masterDB.viewWithDocs(
                    'obs_web',
                    'wcgop_trips_by_observerId',
                    { key: evaluationPeriod.observer }
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
                return trips.filter((trip: any) => {
                    const returnDate = trip.returnDate;
                    if (returnDate && moment(returnDate).isAfter(startDate) &&
                        moment(returnDate).isBefore(endDate)) {
                        return trip;
                    }
                });
            }  catch (err) {
                console.log('could not get trips from evaluation period');
            }
        }
    }

    async getTrips(database: string, collection: string, queryParams: any, options: any) {
        return await mongoRead(database, collection, queryParams, options);
    }
}

export const wcgopTripImpll = new WcgopTripImpl('mongo');